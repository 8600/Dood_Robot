"use strict"
const http = require("http"); //提供web服务  
const url = require("url"); //解析GET请求  
const query = require("querystring"); //解析POST请求
const mongodb = require('mongodb');
const myDate = new Date();
const access_token="/platform/platform/message/send?access_token=-jhO9b6XQFyg963BZte5KJBH1IW5x6ynGzFrquN706gXCLs6_QjfnerQnxvIv8mnalbvubn513KTh0XdT6OFZRLwiuDqL_bO7GmTfVJF0zc&device_type=2";
//设置数据库
const mongodbServer  = new mongodb.Server('127.0.0.1', 27071, {auto_reconnect:true});
const db = new mongodb.Db('robot', mongodbServer, {safe:true});

//模拟接收到的数据
let Json={"userId":1, "subject":"测试", "roomId":2,"member":[1000,1001,1002], "starTime":580, "stopTime":640,"commond":2, "data":19950206,"result":1};
let server =function(request,response){
    response.writeHead(200, {"Content-Type": "text/json"});
    if(request.method=="POST"){
        let postData = "";
        request.addListener("data",function(postChunk){postData+=postChunk;})
        request.addListener("end",function(){
            postData = query.parse(postData);
            Json={
                "userId":parseInt(postData.userId),
                "roomId":parseInt(postData.roomId),
                "starTime":parseInt(postData.starTime),
                "stopTime":parseInt(postData.stopTime),
                "commond":parseInt(postData.commond),
                "data":parseInt(postData.data)
            }
            sendMessage(postData,response);

        })
    }
}


//增加时刻操作
function Reserve(collection,response) {
    let soo={"userId":Json.userId,"roomId":Json.roomId,"starTime":Json.starTime,"stopTime":Json.stopTime,"data":Json.data};
    //寻找 时间在范围内 && 日期一致 && 房间号一致的 数据
    const judge ={"$and":[{"$or":[{"starTime":{"$gte":soo.starTime,"$lte":soo.stopTime}},{"stopTime":{"$gte":soo.starTime,"$lte":soo.stopTime}}]},{"data":soo.data},{"roomId":soo.roomId}]};
    collection.find(judge).toArray(function(err,docs){
        if(docs==""||docs==null){
            collection.insert(soo,{safe:false},function(err,result)
            {
                if(err){
                    response.write("["+toHourMinute(soo.starTime)+"-"+toHourMinute(soo.stopTime)+"]您已经预定过了！!");
                    response.end();
                    db.close();
                }
                else{
                    response.write("预定成功："+"["+toHourMinute(soo.starTime)+"-"+toHourMinute(soo.stopTime)+"]");
                    response.end();
                    db.close();
                }
            })
        }
        else{
            response.write("["+toHourMinute(soo.starTime)+"-"+toHourMinute(soo.stopTime)+"]已经被占用!");
            response.end();
            db.close();
        }
    })
}

//

// 将分钟数量转换为小时和分钟字符串
function toHourMinute(minutes){
    let miu=minutes%60;
    if(miu<10){miu="0"+miu}
    return (Math.floor(minutes/60) + ":" + (miu));
}

//取当前分钟数
function getMinutes() {return myDate.getMinutes()+myDate.getHours()*60;}

//查询时间表
function findTimeTable(collection,data,response){
    //寻找条件 结束时间大于当前时间 && 符合查询日期的 数据
    let echo="<thead><tr><th>会议室</th><th>预定时间</th><th>预定人</th></tr></thead>";
    collection.find({"$and":[{"stopTime":{"$gte":getMinutes()}},{"data":data}]}).toArray(function(err,docs){ 
        if(docs!=""&&docs!=null){
            docs.forEach(function(element) {
                echo+="<tr><td>"+element.roomId+"</td><td>"+toHourMinute(element.starTime)+" - "+toHourMinute(element.stopTime)+"</td><td>"+element.userId+"</td></tr>";
            }, this);
        }
        else{
            echo ="会议室充足，你可以尽情预定";
        }
        response.write(echo);
        response.end();
        db.close();
    })
}

//记录数据
function meetingLog(){
    db.open(function(err,db){
        if(!err){
            db.createCollection("meetingLog",function(err,collection){
                if(!err){
                    collection.insert(Json,{safe:true},function(err,result){});
                    
                }
            })
        }
    })
}

//回复消息
function sendecho(UserID,echo){
    let content = 'msg=%7B%22message%22%3A%22' + echo + '%22%2C%22messageType%22%3A%222%22%2C%22receTargetID%22%3A%22' + UserID + '%22%2C%22sendUserID%22%3A%224328613733%22%7D';
    let options = {hostname: 'vrv.linkdood.cn',port: 80,path: access_token ,method: 'POST',headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}};
    let req = http.request(options,function(res) {
        res.on('content',function(data){
            console.log(data.toString());
        });
    });
    req.write(content);
    req.end();
}

//删除时间表
function removeTimeTable(){
    
}

//回复消息
function sendMessage(postData,response) {
    //连接数据库
    db.open(function(err,db){
        if(!err){
            //连接到表meeting
            db.createCollection("meeting",function(err,collection){
                if(!err){
                    switch(Json.commond){
                        //db.close();关闭之前链接的数据库然后 meetingLog() 写入另一个表，不然会报错
                        case 1:Reserve(collection,response);return;//增加时间 
                        case 2:findTimeTable(collection,Json.data,response);return;//查询时间
                        case 3:removeTimeTable(collection);return;//删除时间
                    }             
                }
            })
        }
    })
}

//开启服务在127.0.0.1:3001
http.createServer(server).listen(3001);
console.log("Server start!");