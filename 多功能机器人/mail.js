"use strict";
const mongodb = require('mongodb');
const dbserver  = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect:true});
const dataBase = new mongodb.Db('mydb', dbserver, {safe:true});
const Imap = require('imap');
const send = require("./send");
const storage = require("./storage");
const data = new storage();

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
                        else fun(docs);
                    }); 
                    dataBase.close();
                }
            });
        }
    });
}

//接收邮件处理进程receive mail
function receive(UserID,account,password) {
    //处理消息的函数
    function receive_mail() {
        const imap = new Imap({
            user: account,
            password: password,
            host: "imap." + account.substring(account.indexOf("@")+1),
            port: 993,
            tls: parseInt(account)
        });
        //第二个参数表示邮件的打开方式是否为只读
        function openInbox(cb) {imap.openBox('INBOX', true, cb);}
        imap.once('ready', function () {
            openInbox(function (err) {
                if (err) send.sendToDood(UserID,"发生错误：" + err,data.access_token);
                else{
                    imap.search(["UNSEEN"], function (err, results) {
                        if (err) send.sendToDood(UserID,"发生错误：" + err,data.access_token);
                        else{
                            send.sendToDood(UserID,'未读邮件数: ' + results.length ,data.access_token);
                        }
                    });
                }
            });
        });
        imap.once('error', function (err) { send.sendToDood(UserID,"发生错误：" + err,data.access_token);});
        imap.connect();
    }
    receive_mail();
}

exports.emilUser = function (UserID) {
    const fun=function(response){
        if(response[0])receive(UserID,response[0].account,response[0].password);
        else send.sendToDood(UserID,data.needToBind,data.access_token);
    };
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
                        send.sendToDood(UserID,result,data.access_token);
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
        send.sendToDood(UserID,"账号:"+response[0].account+"\r\n密码:"+response[0].password,data.access_token);
    };
    findMongoDB(UserID,{"UserID":UserID},fun);
};

//返回有多少个收取邮件
exports.emilNumber = function (UserID){
    const fun=function(response){
        send.sendToDood(UserID,'邮件收取数: ' + response.length,data.access_token);
    };
    findMongoDB(UserID,{"UserID":UserID},fun);
};

//已经绑定用户
exports.emilUser = function (UserID){
    const fun=function(response){
        if(response[0])receive(UserID,response[0].account,response[0].password);
        else send.sendToDood(UserID,"你还没有绑定邮箱\r\n绑定邮箱请回复您的邮箱账号##您的邮箱专属密码\r\n例：123456@qq.com##123456789",data.access_token);
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
                    const mailJson = {"UserID":UserID,"account":account,"password":password,"subscribe":"yes"};
                    collection.find(mailJson).toArray(function(err,docs){
                        if(!docs[0]){
                            collection.insert(mailJson,{safe:true},function(err, result){
                                console.log(result);
                            });
                        }
                        dataBase.close();
                    }); 
                }
            });
        }
    });
    receive(UserID,account,password);
};