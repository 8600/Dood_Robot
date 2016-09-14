"use strict";
const http = require("http"); //提供web服务  
const query = require("querystring"); //解析POST请求
const Imap = require('imap');
const mongodb = require('mongodb');
const dbserver  = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect:true});
const db = new mongodb.Db('mydb', dbserver, {safe:true});
const access_token ="-jhO9b6XQFyg963BZte5KJBH1IW5x6ynGzFrquN706gXCLs6_QjfnerQnxvIv8mnalbvubn513KTh0XdT6OFZRLwiuDqL_bO7GmTfVJF0zc&device_type=2";
 
function sendMessage(UserID,echo,access_token){
    const content = 'msg={"message":"' + echo + '","messageType":"2","receTargetID":"' + UserID + '","sendUserID":"4328613733"}';
    const options = {hostname: 'vrv.linkdood.cn',port: 80,path: "/platform/platform/message/send?access_token=" + access_token,method: 'POST',headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}};
    const Request = http.request(options,function(res) {res.on('content',function(data){console.log(data.toString());});});
    Request.write(encodeURI(content));
    Request.end();
}

//查询数据库
function findMongoDB(UserID,findJson,fun){
    db.open(function(err, db){
        if(err!==null) sendMessage(UserID,err,access_token);
        else{
            db.createCollection('mailRobot', {safe:true}, function(err, collection){
                if(err!==null) sendMessage(UserID,err,access_token);
                else{
                    collection.find(findJson).toArray(function(err,docs){
                        if(err!==null) sendMessage(UserID,err,access_token);
                        else fun(docs);
                    }); 
                    db.close();
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
                if (err) sendMessage(UserID,"发生错误：" + err,access_token);
                else{
                    imap.search(["UNSEEN"], function (err, results) {
                        if (err) sendMessage(UserID,"发生错误：" + err,access_token);
                        else{
                            sendMessage(UserID,'未读邮件数: ' + results.length,access_token);
                        }
                    });
                }
            });
        });
        imap.once('error', function (err) { sendMessage(UserID,"发生错误：" + err,access_token);});
        imap.connect();
    }
    receive_mail();
}

//智能对话
function echo(UserID,ReceiveMessage){
    const tulingAPI={
        hostname: 'www.tuling123.com',
        port: 80,
        path: '/openapi/api?key=bb1b96a394b19b8ce2c61cf32c64d695&userid=' + UserID + '&info=' + encodeURI(ReceiveMessage),
        method: 'GET'
    };
    const getreq = http.request(tulingAPI,function(res) {
        res.setEncoding('utf8');
        res.on('data',function(chunk) {
             sendMessage(UserID,JSON.parse(chunk).text,access_token);
        });
    });
    getreq.on('error',function(e) {console.log('problem with request: ' + e.message);});
    getreq.end();
}

//已经绑定用户
function emilUser(UserID){
    db.open(function(err, db){
        if(err!==null) {sendMessage(UserID,err,access_token);}
        else{
            db.createCollection('mailRobot', {safe:true}, function(err, collection){
                collection.find({"UserID":UserID}).toArray(function(err,docs){
                    if(docs[0]){
                        receive(UserID,docs[0].account,docs[0].password);
                    }
                    db.close();
                });
            });
        }
    });
}

//新增加邮箱用户
function addEmilUser(UserID,account,password){
    db.open(function(err, db){
        if(err!==null) {sendMessage(UserID,err,access_token);}
        else{
            db.createCollection('mailRobot', {safe:true}, function(err, collection){
                if(err!==null) {sendMessage(UserID,err,access_token);}
                else{
                    const mailJson = {"UserID":UserID,"account":account,"password":password};
                    collection.find(mailJson).toArray(function(err,docs){
                        if(!docs[0]){
                            collection.insert(mailJson,{safe:true},function(err, result){
                                console.log(result);
                            });
                        }
                    }); 
                    db.close();
                }
            });
        }
    });
    receive(UserID,account,password);
}

//收到其他命令的判断
function otherCommand(ReceiveMessage,UserID){
    if (ReceiveMessage.indexOf("&&")>-1){
        const account =ReceiveMessage.substring(0,ReceiveMessage.indexOf("&&"));
        const password = ReceiveMessage.substring(ReceiveMessage.indexOf("&&")+2);
        addEmilUser(UserID,account,password);
    }
    else{
        echo(UserID,ReceiveMessage);
    }
}

//返回有多少个收取邮件
function emilNumber(UserID){
    const fun=function(response){
        sendMessage(UserID,'邮件收取数: ' + response.length,access_token);
    };
    findMongoDB(UserID,{"UserID":UserID},fun);
}

//返回豆豆ID绑定的邮箱账户和密码
function queryAssociation(UserID){
    const fun=function(response){
        sendMessage(UserID,"账号:"+response[0].account+"\r\n密码:"+response[0].password,access_token);
    };
    findMongoDB(UserID,{"UserID":UserID},fun);
}

const server = function(request, response) {
    response.writeHead(200, {"Content-Type": "text/json"});
    if (request.method === "GET") { response.write("豆豆机器人！"); response.end();} 
    else {
        let postdata = "";
        request.addListener("data",function(postchunk) { postdata += postchunk;});
        request.addListener("end",function() {
            const Receive = JSON.parse(query.parse(postdata).msg);
            const [UserID,ReceiveMessage]=[Receive.sendUserID, Receive.message.body ];
            //显示谁发来了什么消息
            console.log(UserID + "发来消息：" + ReceiveMessage);
            switch(ReceiveMessage){
                case "收邮件":emilUser(UserID);break;
                case "邮件收取数量":emilNumber(UserID);break;
                case "查询关联":queryAssociation(UserID);break;
                default:otherCommand(ReceiveMessage,UserID);
            }
            response.end();
        });
    }
};

http.createServer(server).listen(3000);
console.log("服务已经开启!");