const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const http = require('http');
const AipImageClassifyClient = require("baidu-aip-sdk").imageClassify;
// paser body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// 设置APPID/AK/SK
var APP_ID = "";
var API_KEY = "";
var SECRET_KEY = "";

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipImageClassifyClient(APP_ID, API_KEY, SECRET_KEY);

//var url = 'http://p0.meituan.net/tuanpic/3df525af5a3f7fe04077567d2a6caf794904.png';  //一张网络图片
//封装远程请求图片并转base64
var imgHttp = function(url,callback){
    http.get(url,function(res){
        　　var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
        　　var size = 0;　　 //保存缓冲数据的总长度
        　　res.on('data',function(chunk){
        　　　　chunks.push(chunk);　 
                                    //在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，
        
        　　　　　　　　　　　　　　　　//node会把接收到的数据片段逐段的保存在缓冲区（Buffer），
        
        　　　　　　　　　　　　　　　　//这些数据片段会形成一个个缓冲对象（即Buffer对象），
        
        　　　　　　　　　　　　　　　　//而Buffer数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），
        
        　　　　　　　　　　　　　　　　//如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，
        
        　　　　　　　　　　　　　　　　//直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到chunks数组中，
        
        　　　　　　　　　　　　　　　　//利用下面的node.js内置的Buffer.concat()方法进行拼接
        　　　　　　　　　
        　　　　size += chunk.length;　　//累加缓冲数据的长度
        　　});
        　　res.on('end',function(err){
        　　　　var data = Buffer.concat(chunks, size);　　//Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data
        　　　　console.log(Buffer.isBuffer(data));　　　　//可通过Buffer.isBuffer()方法判断变量是否为一个Buffer对象
        　　　　var base64Img = data.toString('base64');　　//将Buffer对象转换为字符串并以base64编码格式显示
                callback(base64Img)                    　　　　
        　　});     
        });

}


// 创建前端访问接口
var getAnimalInfo = function(req,res){
    var imageUrl = req.query.value;
    console.log(imageUrl);
    imgHttp(imageUrl,(data)=>{
        client.advancedGeneral(data).then(function(result) {
            console.log(JSON.stringify(result));
            res.send(JSON.stringify(result))
        }).catch(function(err) {
            // 如果发生网络错误
            console.log(err);
        })
    })
    ;

}
var upLoadFile = function(req,res){
    console.log(req)
    res.send('success.....')
}
app.get('/getAnimalInfo',getAnimalInfo);
app.post('/upLoadFile',upLoadFile)




var server = app.listen(8090, function () {
 
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
   
  })