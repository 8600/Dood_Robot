"use strict";
const http = require("http"); //提供web服务
const query = require("querystring"); //解析POST请求
const mail = require("./mail");
const send = require("./send");
const storage = require("./storage");
const data = new storage();

//智能对话
function echo(UserID,ReceiveMessage){
    const tulingAPI={hostname: data.tuLingHost ,port: 80,path: data.tuLingPath + UserID + '&info=' + encodeURI(ReceiveMessage),method: 'GET'};
    const getreq = http.request(tulingAPI,function(res) {
        res.setEncoding('utf8');
        res.on('data',function(chunk) {
            let item = "";
            const message = JSON.parse(chunk);
            switch (message.code) {
                //普通消息
                case 100000: send.sendToDood(UserID,message.text,data.access_token);break;
                //热门电影
                case 308000: message.list.forEach(function (element) { item += `${element.name}---${element.info}\r\n`; }, this); send.sendToDood(UserID, `亲，已帮您找到电影信息:\r\n${item}`, data.access_token); break;
                //热门新闻
                case 302000: message.list.forEach(function (element) { item += `${element.article}\r\n`; }, this); send.sendToDood(UserID, `亲，已帮您找到新闻信息:\r\n${item}`, data.access_token); break;
            }
        });
    });
    getreq.on('error',function(e) {console.log( `请求过程中发生错误:${e.message}`);});
    getreq.end();
}

//收到其他命令的判断
function otherCommand(ReceiveMessage,UserID){
    //如果包含##进入邮箱模式 否则智能对话
    if (ReceiveMessage.indexOf("##")>-1){
        if(ReceiveMessage.indexOf("@")>-1){
            const account = ReceiveMessage.substring(0,ReceiveMessage.indexOf("##"));
            const password = ReceiveMessage.substring(ReceiveMessage.indexOf("##")+2);
            mail.addEmilUser(UserID,account,password);
        }
        else{
            send.sendToDood(UserID,data.mailboxFormatIsNotCorrect,data.access_token);
        }
    }
    else echo(UserID,ReceiveMessage);
}


const server = function(request, response) {
    response.writeHead(200, {"Content-Type": "text/json"});
    if (request.method === "GET") { response.write("豆豆机器人！"); response.end();}
    else {
        let postdata = "";
        request.addListener("data",function(postchunk) { postdata += postchunk;});
        request.addListener("end",function() {
            const Receive = JSON.parse(query.parse(postdata).msg);
            //收到奇怪的消息屏蔽掉
            if(Receive.message&&Receive.message.body){
                const [UserID,ReceiveMessage,receTargetID]=[Receive.sendUserID, Receive.message.body, Receive.receTargetID];
                if(receTargetID === "4328613733") {
                    //显示谁发来了什么消息
                    console.log(`${UserID}发来消息：${ReceiveMessage}`);
                    switch(ReceiveMessage){
                        case "收邮件":mail.emilUser(UserID);break;
                        case "邮件收取数量":mail.emilNumber(UserID);break;
                        case "查询关联":mail.queryAssociation(UserID);break;
                        case "解除关联":mail.relieveAssociation(UserID);break;
                        case "定时开关":mail.timedTask(UserID);break;
                        case "如何绑定邮箱":send.sendToDood(UserID,data.howToBind,data.access_token);break;
                        default:otherCommand(ReceiveMessage,UserID);
                    }
                }
                response.end();
            }
            else{
                response.end();
                const [UserID,ReceiveMessage]=[Receive.sendUserID, Receive.message];
                switch(ReceiveMessage){
                    case "emilUser":mail.emilUser(UserID);break;
                    case "queryAssociation":mail.queryAssociation(UserID);break;
                    case "relieveAssociation":mail.relieveAssociation(UserID);break;
                    case "howToBind":send.sendToDood(UserID,data.howToBind,data.access_token);break;
                    case "command":send.sendToDood(UserID,data.command,data.access_token);break;
                    case "joke":echo(UserID,"讲个笑话");break;
                    case "story":echo(UserID,"讲个故事");break;
                    case "news":echo(UserID,"今日新闻");break;
                    case "movie":echo(UserID,"最近热门电影");break;
                }
            }
        });
    }
};

http.createServer(server).listen(3000);
console.log("服务已经开启!");