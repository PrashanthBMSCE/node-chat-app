var socket = io();
socket.on('connect', function () {
    console.log('Connected to server')

});
socket.on('disconnect', function () {
    console.log('user disconnected')
})

socket.on('newMessage', function (message) {
    console.log('newMessage', message);
    var li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`);
    jQuery('#messages').append(li);

});
// socket.emit('createMessage', {
//     from: 'frank',
//     text: 'hi'
// }, function (data) {
//     console.log('got it', data)
// })

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val()
    }, function () {
        jQuery('[name=message]').val('')

    })

})

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser!!');

    }
    locationButton.attr('disabled', 'disabled').text('sending location...')
    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('sendLocation')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
        console.log(position);
    }, function () {
        locationButton.removeAttr('disabled').text('sendLocation')
        console.log('unable to fetch location')
    })
})

socket.on('newLocationMessage', function (coords) {
    var li = jQuery('<li></li>');
    var a = jQuery('<a target="_blank">My current location</a>');
    li.text(`${coords.from}`)
    a.attr('href', coords.url);
    li.append(a);
    jQuery('#messages').append(li);

})