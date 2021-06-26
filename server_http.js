// http版本的服务器
var http = require('http');

var app = http.createServer(function(req, res){
  console.log('req', req)
  console.log('res', res)
  res.writeHead(200,{
    'Content-Type': 'text/plain'
  })
  res.end('Hello World!\n')
});

// 0.0.0.0 代表任意网口
app.listen(8899,() => {
  console.log('服务器创建成功！')
});