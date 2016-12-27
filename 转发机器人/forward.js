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
            postdata = postdata.replace(/%0A/g,"");
			postdata = postdata.replace(/%0a/g,"");
			postdata = postdata.replace(/%0D/g,"");
			postdata = postdata.replace(/%0d/g,"");
            postdata = postdata.replace(/%09/g,"");
			console.log(postdata);
			let post = "false";
            try {
                const Receive = JSON.parse(Query.parse(postdata).msg);
			    if(Receive){
				    const [UserID,ReceiveMessage]=[Receive.receTargetID, Receive.message ];
				    if(UserID&&ReceiveMessage){
					    post="ture";
					    sendToDood(UserID,ReceiveMessage);
				    }
			    }
                response.write(post);
                response.end();
            }
            catch(e){
                response.write("数据出现未知编码！");
                response.end();
            }
            
			
        });
    }
};

Http.createServer(server).listen(3002);
console.log("正在监听!");
