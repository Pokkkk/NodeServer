var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
//app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;



io.sockets.on('connection', function (socket) {
    var addedUser = false;
    //console.log(roomNum);
    var roomId;

    socket.on('create room', function(crno){
        console.log(crno+"crno");
        roomId = crno;
        console.log("roomNum: "+ roomId);
        socket.join(roomId.toString());
        console.log("roomList: "+ io.sockets.adapter.rooms);
        console.log("join");
    });

    socket.on('join room', function(){
      ////////////////////////////////////// to do
    });


    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        console.log(data['crno']+data['msg']);
        socket.to(data['crno']).emit('new message', {
            username: socket.username,
            message: data['msg']
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers,
        });
        // echo globally (all clients) that a person has connected
        socket.to(roomId).emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.to(roomId).emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.to(roomId).emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.to(roomId).emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
