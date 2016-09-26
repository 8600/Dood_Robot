"use strict";
const Http = require("http");
const Query = require("querystring"); //解析POST请求
const access_token ="-jhO9b6XQFyg963BZte5KJBH1IW5x6ynGzFrquN706gXCLs6_QjfnerQnxvIv8mnalbvubn513KTh0XdT6OFZRLwiuDqL_bO7GmTfVJF0zc&device_type=2";

function sendToDood(UserID,echo){
    const content = 'msg={"message":"' + echo + '","messageType":"2","receTargetID":"' + UserID + '","sendUserID":"4328613733"}';
    const options = {hostname: 'vrv.linkdood.cn',port: 80,path: "/platform/platform/message/send?access_token=" + access_token,method: 'POST',headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}};
    const Request = Http.request(options,function(res) {res.on('content',function(data){console.log(data.toString());});});
    Request.write(encodeURI(content));
    Request.end();
}

const server = function(request,response){  
    response.writeHead(200,{"Content-Type":"text/json"});
    if(request.method === "GET"){
        response.write("收到GET请求");
        response.end();
    }
    else{
        let postdata = "";
        request.addListener("data",function(postchunk){
            postdata += postchunk;
        });
        request.addListener("end",function(){
            const Receive = JSON.parse(Query.parse(postdata).msg);
            const [UserID,ReceiveMessage]=[Receive.sendUserID, Receive.message.body ];
            sendToDood(UserID,ReceiveMessage);
            response.end();   
        });
    }
};

Http.createServer(server).listen(3002);  
console.log("正在监听!");  