const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const api = require('./server/api')

server.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('message', api.query(socket))
});
