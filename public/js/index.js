var socket = io();
socket.on('connect', function () {
    console.log('Connected to server')

});
socket.on('disconnect', function () {
    console.log('user disconnected')
})

socket.on('newMessage', function (mesaage) {
    console.log('newMessage', mesaage);

})