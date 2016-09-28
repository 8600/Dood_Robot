"use strict";
const mongodb = require('mongodb');
const dbserver  = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect:true});
const dataBase = new mongodb.Db('mydb', dbserver, {safe:true});
const Imap = require('imap');
const send = require("./send");
const storage = require("./storage");
const data = new storage();
const CryptoJS = require("crypto-js");
const inspect = require('util').inspect;

//查询数据库
function findMongoDB(UserID,findJson,fun){
    dataBase.open(function(err, dataBase){
        if(err!==null) send.sendToDood(UserID,err,data.access_token);
        else{
            dataBase.createCollection('mailRobot', {safe:true}, function(err, collection){
                if(err!==null) send.sendToDood(UserID,err,data.access_token);
                else{
                    collection.find(findJson).toArray(function(err,docs){
                        if(err!==null) send.sendToDood(UserID,err,data.access_token);
                        else fun (docs);
                    }); 
                    dataBase.close();
                }
            });
        }
    });
}
//切割字符串
function cutString(original, before, after, index){
    index=index||0;
    if (typeof index === "number"){var P = original.indexOf(before, index);
        if (P>-1) {
            if (after) {var f = original.indexOf(after, P + 1);
                if (f>-1) {return original.substring(P + before.toString().length, f);}
                else {console.error("owo [在文本中找不到 参数三 "+after+"]");}
            }else {return original.substring(P + before.toString().length);}
        }else {console.error("owo [在文本中找不到 参数一 "+before+"]");}
    }else{console.error("owo [sizeTransition:"+index+"不是一个整数!]");}
}


//取出消息
function processing_message(UserID,message, imap,mailNumber,sendMessage) {
    let Number = mailNumber;
    message.on('message', function (msg) {
        msg.on('body', function (stream, info) {
            //正文内容的处理
            let buffer = ""; Number--;
            if (info.which === 'TEXT') { console.log (`邮件内容${inspect(info.which)}, 总长度：${info.size}`); }
            stream.on('data', function (chunk) { buffer += chunk.toString('utf8');});
            stream.once('end', function () {
                if (info.which !== 'TEXT') { 
                    const mailHeader = inspect(Imap.parseHeader(buffer));//邮件头部
                    //分离出发件人和收件人
                    sendMessage += "发件人:"+cutString(mailHeader,"from: [ "," ]")+"\r\n主题:"+cutString(mailHeader,"subject: [ "," ]")+"\r\n----------------------------------\r\n";
                    if(Number<1){
                        sendMessage = sendMessage.replace(/"/g,"");
                        send.sendToDood(UserID,sendMessage,data.access_token);
                    }
                }
                else console.log(`消息主体:${inspect(info.which)}加载完毕`);
            });
        });
    });

    message.once('error', function (err) {
        console.log(`关闭邮件发生错误:${err}`);
    });

    message.once('end', function () {
        imap.end();
    });
}

//接收邮件处理进程receive mail
function receive(UserID,account,password,beSureToRemind) {
    //处理消息的函数
    function receive_mail() {
        const imap = new Imap({ user: account, password: password,host: "imap." + account.substring(account.indexOf("@")+1),port: 993,tls: parseInt(account)});
        //第二个参数表示邮件的打开方式是否为只读
        function openInbox(cb) {imap.openBox('INBOX', true, cb);}
        imap.once('ready', function () {
            openInbox(function (err) {
                if (err) send.sendToDood(UserID,`发生错误1：${err}`,data.access_token);
                else{
                    imap.search(["UNSEEN"], function (err, results) {
                        if (err) send.sendToDood(UserID,`发生错误2：${err}`,data.access_token);
                        else{
                            let mailNumber = results.length;
                            let sendMessage = `未读邮件数：${mailNumber}\r\n----------------------------------\r\n`;
                            if (beSureToRemind || mailNumber) {
                                if (mailNumber){
                                    const message = imap.fetch(results, { bodies: '', markSeen: true });
                                    processing_message(UserID,message,imap,mailNumber,sendMessage);//对得到的数据处理
                                }
                                else{
                                    send.sendToDood(UserID,`未读邮件数: ${mailNumber}` ,data.access_token);
                                }
                            }
                        }
                    });
                }
            });
        });
        imap.once('error', function (err) { 
            const message = err +``;
            if(message.indexOf(data.qqAuthorizedCode)>-1){
                send.sendToDood(UserID,data.qqAuthorized,data.access_token);
            }
            else{
                send.sendToDood(UserID,`发生错误3：${err}`,data.access_token);
            }
        });
        imap.connect();
    }
    receive_mail();
}

//已经绑定用户
exports.emilUser = function (UserID) {
    const fun=function(response){
        if(response[0]){
            //解密密码
            const password = CryptoJS.AES.decrypt(response[0].password, data.key).toString(CryptoJS.enc.Utf8);
            receive(UserID,response[0].account,password,true);
        }
        else send.sendToDood(UserID,data.needToBind,data.access_token);
    };
    //通过UserID找用户邮箱账号密码
    findMongoDB(UserID,{"UserID":UserID},fun);

};

//解除关联
exports.relieveAssociation = function (UserID){
    dataBase.open(function(err, dataBase){
        if(err!==null) send.sendToDood(UserID,err,data.access_token);
        else{
            dataBase.createCollection('mailRobot', {safe:true}, function(err, collection){
                if(err!==null) send.sendToDood(UserID,err,data.access_token);
                else{
                    collection.remove({"UserID":UserID},{safe:true},function(err,result){
                        if(err)send.sendToDood(UserID,data.releaseAssociatedError,data.access_token);
                        else send.sendToDood(UserID,data.releaseAssociatedOK,data.access_token);
                    });
                    dataBase.close();
                }
            });
        }
    });
};

//返回豆豆ID绑定的邮箱账户和密码
exports.queryAssociation = function (UserID){
    const fun=function(response){
        if(response[0]){
            send.sendToDood(UserID,`账号:${response[0].account}\r\n密码:${response[0].password}`,data.access_token);
        }
        else{
            send.sendToDood(UserID,`没有绑定任何邮箱！`,data.access_token);
        }
    };
    findMongoDB(UserID,{"UserID":UserID},fun);
};

//返回有多少个收取邮件
exports.emilNumber = function (UserID){
    const fun=function(response){
        send.sendToDood(UserID,`邮件收取数:${response.length}`,data.access_token);
    };
    findMongoDB(UserID,{"UserID":UserID},fun);
};


//新增加邮箱用户
exports.addEmilUser = function (UserID,account,password){
    dataBase.open(function(err, dataBase){
        if(err!==null) {send.sendToDood(UserID,err,data.access_token);}
        else{
            dataBase.createCollection('mailRobot', {safe:true}, function(err, collection){
                if(err!==null) {send.sendToDood(UserID,err,data.access_token);}
                else{
                    //加密存储密码
                    const passwordAES = CryptoJS.AES.encrypt(password,data.key).toString();
                    const mailJson = {"UserID":UserID,"account":account,"password":passwordAES,"subscribe":"yes"};
                    collection.find(mailJson).toArray(function(err,docs){
                        if(!docs[0]){
                            collection.insert(mailJson,{safe:true},function(err){
                                if(!err) receive(UserID,account,password,true);
                            });
                        }
                        dataBase.close();
                    }); 
                }
            });
        }
    });
};

exports.timedTask = function(UserID){
    if(UserID!==data.admin) return null;
    if(data.timedTask){
        clearInterval(data.Interval);
        data.timedTask = false;
        send.sendToDood(data.admin,"自动收取功能已关闭！",data.access_token);
    }
    else{
        const timeoutTime = 60000*data.timeoutTime;
        //定时收取邮件的核心内容
        const loop = function(){
            const fun=function(response){
                if(response[0]){
                    response.forEach(function (filename) {
                        //解密密码
                        const password = CryptoJS.AES.decrypt(filename.password, data.key).toString(CryptoJS.enc.Utf8);
                        receive(UserID,filename.account,password,false);
                    });
                }
                else send.sendToDood(UserID,data.needToBind,data.access_token);
            };
            findMongoDB(UserID,{"subscribe":"yes"},fun);
        };
        data.Interval = setInterval(loop, timeoutTime);
        data.timedTask = true;
        send.sendToDood(data.admin,"自动收取功能已开启！",data.access_token);
    }
};