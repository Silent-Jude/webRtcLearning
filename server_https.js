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

    // 1v1链接，最大人数限制为2,
    if(userCount <= USERLIMITCOUNT) {
      socket.emit('joined', { // 给对端反馈，通知加入成功。
        roomId,
        id: socket.id,
      })
      if(userCount > 1) {
        socket.to(roomId).emit('otherJoin',{ // 通知其他人，有人加入房间。
          roomId,
          id: socket.id,
        })
      }
    } else { // 人数满了，需要踢出去。
      socket.leave(room)
      socket.emit('full', {
        roomId,
        id: socket.id,
      })
    }

		// socket.emit('joined', roomId, socket.id) // 给该客户端单独返回消息。
		// socket.to(roomId).emit('joined', roomId, socket.id) // 给房间内，除了自己以外的所有人返回消息。
		// io.in(roomId).emit('joined', { // 给房间内的所有人都发送消息。
		// 	userCount,
		// 	roomId,
		// 	id: socket.id,
		// })
		// socket.broadcast.emit('joined', roomId, socket.id) // 给出了自己，全部站点的所有人发送消息。broadcast 广播
	})

	socket.on('leave', (roomId) => {
		console.log('join success, roomId is ', roomId)
		socket.leave(roomId)
		// const myRoom = io.sockets.adapter.rooms[roomId]
    const userCount = io.sockets.adapter.rooms.get(roomId).size
		console.log(`the number of user is : ${userCount}`)


    socket.to(roomId).emit('bye',{ // 给其他人发送bye
      roomId,
      id: socket.id,
    })
    socket.emit('leaved',{ // 给自己发送leaved
      roomId,
      id: socket.id,
    })

		// socket.emit('joined', roomId, socket.id) // 给该客户端单独返回消息。
		// socket.to(roomId).emit('joined', roomId, socket.id) // 给房间内，除了自己以外的所有人返回消息。
		// io.in(roomId).emit('left', { // 给房间内的所有人都发送消息。
		// 	userCount,
		// 	roomId,
		// 	id: socket.id,
		// })
		// socket.broadcast.emit('left', roomId, socket.id) // 给出了自己，全部站点的所有人发送消息。broadcast 广播
	})

	socket.on('message', (roomId, data) => {
    console.log('收到消息', data)
		socket.to(roomId).emit('message',{
			roomId,
			id: socket.id,
			data,
    })
		// io.in(roomId).emit('message', {
		// 给房间内的所有人都发送消息。
		// 	roomId,
		// 	id: socket.id,
		// 	data,
		// })
	})
})

https_server.listen(443, '0.0.0.0', (_) => {
	console.log(`https服务器创建成功！启动时间:${new Date().toLocaleString()}`)
	console.log('访问地址:')
	// console.log('https://10.0.0.95:443')
	console.log('https://tongyichen.com')
})