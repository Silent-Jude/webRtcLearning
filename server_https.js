'use strict'
var http = require('http')
var https = require('https')
var fs = require('fs')
var express = require('express')
var serveIndex = require('serve-index')



const app = express()

// 浏览指定目录，加上这个之后就可以浏览静态资源目录。
app.use(serveIndex('./public'))
// 静态资源发布到指定目录
app.use(express.static('./public'))

// http_server
// const http_server = http.createServer(app)
// http_server.listen(80,'0.0.0.0', _=>{
//   console.log('http服务器创建成功！访问地址:http://106.55.160.183:80')
// })

const options = {
  key: fs.readFileSync('./cert/tongyichen.com.key'),
  cert: fs.readFileSync('./cert/tongyichen.com.pem'),
}
const https_server = https.createServer(options,app,(req, res)=>{})
https_server.listen(443,'0.0.0.0', _=>{
  console.log(`https服务器创建成功！启动时间:${new Date().toLocaleString()}`)
  console.log('访问地址:')
  console.log('https://106.55.160.183:443')
  console.log('https://tongyichen.com')

})


// var app = https.createServer(options,(req, res)=>{
//   console.log('req', req)
//   console.log('res', res)
//   res.writeHead(200,{
//     'Content-Type': 'text/plain'
//   })
//   res.end('Hello World!\n')
// });

// // 0.0.0.0 代表任意网口
// app.listen(8899,() => {
//   console.log('服务器创建成功！')
//   console.log('访问地址:https://192.168.1.153:8899')

// });