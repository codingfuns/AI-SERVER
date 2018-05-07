const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const http = require('http');
const AipImageClassifyClient = require("baidu-aip-sdk").imageClassify;
var multer  = require('multer')

// paser body
app.use(bodyParser.json())
app.use(express.static('page'))
// 这里dest对应的值是你要将上传的文件存的文件夹
var upload = multer({dest:'page/uploads'});
//上传保存在内存中
// var storage = multer.memoryStorage()
// var upload = multer({ storage: storage })


// 设置APPID/AK/SK
var APP_ID = "";
var API_KEY = "";
var SECRET_KEY = "";

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipImageClassifyClient(APP_ID, API_KEY, SECRET_KEY);


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
var getAnimalInfo = 
/**
 * @description 本地上传图片的方式识别，支持单文件上传
 */
app.post("/upload", upload.single('file'),(req, res) => {
    
    // req.file 是 'file' 文件的信息 （前端传递的文件类型在req.file中获取）
    // req.body 将具有文本域数据，如果存在的话  。（上面前端代码中传递的date字段在req.body中获取）
    console.log(req.body) //{ date: '2018/1/20 下午5:25:56' }
    console.log(req.file)
    console.log(req.file)

    /*-------如果设置将上传的图片保存在内存中，则用以下方式-----------*/

    // console.log(req.file.buffer.toString('base64'))
    // var data = req.file.buffer.toString('base64')
    // client.advancedGeneral(data).then(function(result) {
    //     console.log(JSON.stringify(result));
    //     res.send(JSON.stringify(result))
    // }).catch(function(err) {
    //     // 如果发生网络错误
    //     console.log(err);
    // })


    /*-----保存在本地目录，且不用预览------*/
    var data = 'page/uploads/' + req.file.filename
    var imgage = fs.readFileSync(data).toString("base64");
    client.advancedGeneral(imgage).then(function(result) {
        var sendData = {
            animalRes:result,
            imgUrl:'./uploads/' + req.file.filename
        }
        console.log(JSON.stringify(sendData));
        res.send(JSON.stringify(sendData))
    }).catch(function(err) {
        // 如果发生网络错误
        console.log(err);
    })

    /*------保存在本地，需要预览,可用以下方式 ------*/

    // var file_type;
    // if (req.file.mimetype.split('/')[0] == 'image') file_type = '.' + req.file.mimetype.split('/')[1];
    // if (file_type) {
    //     fs.rename(req.file.path, req.file.path + file_type, function (err, doc) {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }
    //         var data = 'page/uploads/' + req.file.filename + file_type
    //         var imgage = fs.readFileSync(data).toString("base64");
    //         client.advancedGeneral(imgage).then(function(result) {
    //                     console.log(JSON.stringify(result));
    //                     var sendData = {
    //                         animalRes:result,
    //                         imgUrl:data
    //                     }
    //                     res.send(JSON.stringify(sendData))
    //                 }).catch(function(err) {
    //                     // 如果发生网络错误
    //                     console.log(err);
    //                 })
    //     })
    //     return;
    // }
})

/*-----网络图片识别-------*/
app.get('/getAnimalInfo',function(req,res){
    var imageUrl = req.query.value;
    console.log(imageUrl);
    imgHttp(imageUrl,(data)=>{
        client.advancedGeneral(data).then(function(result) {
            var sendData = {
                animalRes:result,
                imgUrl:data
            }
            console.log(JSON.stringify(sendData));
            res.send(JSON.stringify(sendData))
        }).catch(function(err) {
            // 如果发生网络错误
            console.log(err);
        })
    });

});


var server = app.listen(8080, function () {
 
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
   
  })