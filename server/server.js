const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
io.on('connection', (socket) => {
    console.log('new user connected');
    socket.emit('newMessage', {
        from: 'Admin',
        text: 'welcome to chat',
        createdAt: new Date().getTime()
    })
    socket.broadcast.emit('newMessage', {
        from: 'Admin',
        text: 'new user joined',
        createdAt: new Date().getTime()

    })
    socket.on('createMessage', (message) => {
        console.log('new message', message);
        io.emit('newMessage', { from: message.from, text: message.text, createdAt: new Date().getTime() })
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })


})


server.listen(port, () => {
    console.log(`server is on port ${port}`);

})
