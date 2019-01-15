const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/user');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var users = new Users();

app.use(express.static(publicPath));
io.on('connection', (socket) => {
    console.log('new user connected');


    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and  room are required!!')
        }
        socket.join(params.room)
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room))
        //socket.leave('params.room')
        //io.emit->io.to('the office fans').emit
        //socket.broadcast  .emit->socket.broadcast.to('the office Fans).emit
        //socket.emit
        socket.emit('newMessage', {
            from: 'Admin',
            text: 'welcome to chat',
            createdAt: new Date().getTime()
        })
        socket.broadcast.to(params.room).emit('newMessage', {
            from: 'Admin',
            text: `${params.name} has joined.`,
            createdAt: new Date().getTime()

        })

        callback();
    })
    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback('this is from server')
    })

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the chat`))

        }
    })

    socket.on('sendLocation', (coords) => {
        var user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude))

        }
    })



})


server.listen(port, () => {
    console.log(`server is on port ${port}`);

})
