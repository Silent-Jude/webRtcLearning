'use strict'
// const http = require('http')
const https = require('https')
const fs = require('fs')
const express = require('express')
const serveIndex = require('serve-index')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()

// 浏览指定目录，加上这个之后就可以浏览静态资源目录。
app.use(serveIndex('./public'))
// 静态资源发布到指定目录
app.use(express.static('./public'))

app.use(
	cors({
		credentials: true,
		origin: ['http://127.0.0.1:5500'],
	})
)

// http_server
// const http_server = http.createServer(app)
// http_server.listen(80,'0.0.0.0', _=>{
//   console.log('http服务器创建成功！访问地址:http://106.55.160.183:80')
// })

const options = {
	key: fs.readFileSync('./cert/tongyichen.com.key'),
	cert: fs.readFileSync('./cert/tongyichen.com.pem'),
}
const https_server = https.createServer(options, app, (req, res) => {})
// bind socket.io with https_server
const io = socketIo(https_server)

//io.sockets 站点， socket，当前客户端。
io.sockets.on('connection', (socket) => {
	// socket代表每一个客户端
	socket.on('join', (roomId) => {
		console.log('join success, roomId is ', roomId)
		socket.join(roomId)
		const myRoom = io.sockets.adapter.rooms[room]
		const userCount = Object.keys(myRoom.sockets).length
		console.log(`the number of user is : ${userCount}`)
		// socket.emit('joined', roomId, socket.id) // 给该客户端单独返回消息。
		// socket.to(roomId).emit('joined', roomId, socket.id) // 给房间内，除了自己以外的所有人返回消息。
		io.in(room).emit('joined', {
			// 给房间内的所有人都发送消息。
			userCount,
			roomId,
			id: socket.id,
		})
		// socket.broadcast.emit('joined', roomId, socket.id) // 给出了自己，全部站点的所有人发送消息。broadcast 广播
	})

	socket.on('leave', (roomId) => {
		console.log('join success, roomId is ', roomId)
		socket.leave(roomId)
		const myRoom = io.sockets.adapter.rooms[room]
		const userCount = Object.keys(myRoom.sockets).length
		console.log(`the number of user is : ${userCount}`)
		// socket.emit('joined', roomId, socket.id) // 给该客户端单独返回消息。
		// socket.to(roomId).emit('joined', roomId, socket.id) // 给房间内，除了自己以外的所有人返回消息。
		io.in(room).emit('left', {
			// 给房间内的所有人都发送消息。
			userCount,
			roomId,
			id: socket.id,
		}) // 给房间内的所有人都发送消息。
		// socket.broadcast.emit('left', roomId, socket.id) // 给出了自己，全部站点的所有人发送消息。broadcast 广播
	})

	socket.on('message', (roomId, data) => {
		socket.to(roomId).emit('message', {
			// 给房间内，除了自己以外的所有人返回消息。
			userCount,
			roomId,
			id: socket.id,
			data,
		})
	})
})

https_server.listen(443, '0.0.0.0', (_) => {
	console.log(`https服务器创建成功！启动时间:${new Date().toLocaleString()}`)
	console.log('访问地址:')
	console.log('https://106.55.160.183:443')
	console.log('https://tongyichen.com')
})

// const app = https.createServer(options,(req, res)=>{
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
