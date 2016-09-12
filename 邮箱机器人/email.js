"use strict";
const Imap = require('imap');
const inspect = require('util').inspect;
const http = require("http");
const Mailparser = require('mailparser').MailParser;
const nodemailer = require('nodemailer');

//回复消息的函数
function echo(text,response) {

    response.writeHead(200, { "Content-Type": "text/json" });
    response.write(text);
    response.end();
}

//接收邮件处理进程receive mail
function receive(params, response,condition,showContents) {
    let Send = "";
    //整理邮件内容
    function finishing_content(stream, info, prefix) {
        let buffer = "",mailparser = new Mailparser();
        if (info.which === 'TEXT') {
            Send += prefix + '邮件内容:'+inspect(info.which)+', 总长度：'+info.size;
        }
        stream.on('data', function (chunk) {
            buffer += chunk.toString('utf8');
        });
        stream.once('end', function () {
            if (info.which !== 'TEXT') { Send += "\r\n" + prefix + '邮件头部:［' + inspect(Imap.parseHeader(buffer)) + "]"; }
            else console.log(prefix + '消息主体: [%s] 加载完毕', inspect(info.which));
        });

        if(showContents){
            stream.pipe(mailparser);
            mailparser.on('end', function (mail) {
                Send += "\r\n" + prefix + '邮件内容:［' + mail.html + "]";
            });
        }

    }

    //格式化消息
    function sort_messages(msg, seqno) {
        const prefix = '[#' + seqno + ']';
        msg.on('body', function (stream, info) {
            //正文内容的处理
            finishing_content(stream, info, prefix);
        });
        msg.once('attributes', function (attrs) {
            Send += "\r\n" + prefix + '属性:' + inspect(attrs, false, 8);
        });
        msg.once('end', function () {
            Send += prefix + '加载完毕';
        });
    }

    //取出消息
    function processing_message(message, imap) {
        message.on('message', function (msg, seqno) {
            sort_messages(msg, seqno);
        });

        message.once('error', function (err) {
            Send += '关闭邮件发生错误: ' + err;
        });

        message.once('end', function () {
            Send += '所有邮件读取完毕!';
            imap.end();
        });
    }

    //处理消息的函数
    function receive_mail(params) {

        const imap = new Imap({
            user: params.username,
            password: params.password,
            host: "imap." + params.server,
            port: 993,
            tls: parseInt(params.username)
        });
        function openInbox(cb) {
            //第二个参数表示邮件的打开方式是否为只读
            imap.openBox('INBOX', false, cb);
        }
        //等待触发ready
        imap.once('ready', function () {
            openInbox(function (err) {
                if (err) Send += "发生错误：" + err;
                else{
                    //搜寻复合要求的邮件
                    imap.search([condition], function (err, results) {
                        if (err) Send += "发生错误：" + err;
                        else{
                            Send += '找到邮件数: ' + results.length;
                            try {
                              const message = imap.fetch(results, { bodies: '', markSeen: true });
                              processing_message(message, imap);//对得到的数据处理
                            }
                            catch (e) {
                              Send = '没有收取到邮件';
                              echo(Send,response);
                            }
                        }
                    });
                }

            });
        });

        imap.once('error', function (err) { Send = "发生错误:" + err; });
        imap.once('end', function () { echo(Send,response); });
        imap.connect();
    }

    receive_mail(params, response);
}

//发送邮件函数
function send(params, response){
    const transporter = nodemailer.createTransport('smtps://'+params.username+':'+params.password+'@smtp.'+params.server);
    const mailOptions = {
        from: params.username,
        to: params.addressee,
        subject: params.theme,
        text: 'Hello world',
        html: params.text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){return error;}
        echo(info.response,response);
    });
}

//判断得到发来消息的类型
let server = function (request, response) {
    let postdata = "";
    if (request.method === "GET") {
        echo("错误的请求方式",response);
    }
    else {
        request.addListener("data", function (postchunk) {
            postdata += postchunk;
        });
        request.addListener("end", function () {
            const params = JSON.parse(postdata);
            switch(params.command){
                case "receive":receive(params, response,"UNSEEN",true);break;
                case "send":send(params, response);break;
                case "recent":receive(params, response,"ALL",false);break;
            }
        });
    }
};

http.createServer(server).listen(3100);
console.log("邮件服务已开启!");
