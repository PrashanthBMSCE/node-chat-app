var socket = io();

function scrollToBottom() {
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child')
    //heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function () {
    console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err)
            window.location.href = '/'
        } else {
            console.log('no error')
        }
    })

});
socket.on('disconnect', function () {
    console.log('user disconnected')
})

socket.on('updateUserList', function (users) {
    var ol = jQuery('<ol></ol>');
    users.forEach(function (user) {
        ol.append(jQuery('<li></li>').text(user));
    })
    jQuery('#users').html(ol);
})

socket.on('newMessage', function (message) {
    var formatedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formatedTime
    })
    jQuery('#messages').append(html);
    scrollToBottom();
    // var li = jQuery('<li></li>');
    // li.text(`${message.from} ${formatedTime}: ${message.text}`);
    // jQuery('#messages').append(li);

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
    var formatedTime = moment(coords.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        from: coords.from,
        url: coords.url,
        createdAt: formatedTime
    })
    jQuery('#messages').append(html);
    scrollToBottom();



    // var formatedTime = moment(coords.createdAt).format('h:mm a');
    // var li = jQuery('<li></li>');
    // var a = jQuery('<a target="_blank">My current location</a>');
    // li.text(`${coords.from} ${formatedTime}`)
    // a.attr('href', coords.url);
    // li.append(a);
    // jQuery('#messages').append(li);

})