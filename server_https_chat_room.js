'use strict'
// const http = require('http')
const https = require('https')
const fs = require('fs')
const express = require('express')
const serveIndex = require('serve-index')
const socketIo = require('socket.io')

const app = express()
const USERLIMITCOUNT = 2
// 浏览指定目录，加上这个之后就可以浏览静态资源目录。
app.use(serveIndex('./public'))
// 静态资源发布到指定目录
app.use(express.static('./public'))

const options = {
	key: fs.readFileSync('./cert/tongyichen.com.key'),
	cert: fs.readFileSync('./cert/tongyichen.com.pem'),
}
const https_server = https.createServer(options, app, (req, res) => {
  console.log('req', req)
})
// bind socket.io with https_server, options 参考https://www.w3cschool.cn/socket/socket-odxe2egl.html,此文档并不齐全。
const io = socketIo(https_server, {
  cors: true // 中文文档没更新，看代码找到的设置cors为true即可解决跨域问题，nice
})

//io.sockets 站点， socket，当前客户端。
io.sockets.on('connection', (socket) => {
	// socket代表每一个客户端
	socket.on('join', (roomId) => {
		console.log('join success, roomId is ', roomId)
		socket.join(roomId)
		// const myRoom = io.sockets.adapter.rooms[roomId]
    const userCount = io.sockets.adapter.rooms.get(roomId).size
		console.log(`the number of user is : ${userCount}`)
		// socket.emit('joined', roomId, socket.id) // 给该客户端单独返回消息。
		// socket.to(roomId).emit('joined', roomId, socket.id) // 给房间内，除了自己以外的所有人返回消息。
		io.in(roomId).emit('joined', {
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
		// const myRoom = io.sockets.adapter.rooms[roomId]
    const userCount = io.sockets.adapter.rooms.get(roomId).size
		console.log(`the number of user is : ${userCount}`)
		// socket.emit('joined', roomId, socket.id) // 给该客户端单独返回消息。
		// socket.to(roomId).emit('joined', roomId, socket.id) // 给房间内，除了自己以外的所有人返回消息。
		io.in(roomId).emit('left', {
			// 给房间内的所有人都发送消息。
			userCount,
			roomId,
			id: socket.id,
		}) // 给房间内的所有人都发送消息。
		// socket.broadcast.emit('left', roomId, socket.id) // 给出了自己，全部站点的所有人发送消息。broadcast 广播
	})

	socket.on('message', (roomId, data) => {
    console.log('收到消息', data)
		// socket.to(roomId).emit('message', {
		io.in(roomId).emit('message', {
			// 给房间内的所有人都发送消息。
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