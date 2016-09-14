"use strict";
const http = require("http"); //提供web服务  

// 向豆豆发送消息
exports.sendToDood = function (UserID,echo,access_token){
    const content = 'msg={"message":"' + echo + '","messageType":"2","receTargetID":"' + UserID + '","sendUserID":"4328613733"}';
    const options = {hostname: 'vrv.linkdood.cn',port: 80,path: "/platform/platform/message/send?access_token=" + access_token,method: 'POST',headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}};
    const Request = http.request(options,function(res) {res.on('content',function(data){console.log(data.toString());});});
    Request.write(encodeURI(content));
    Request.end();
};