var express = require('express');
var app = express();
var gcm = require('node-gcm');
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var message = new gcm.Message();
var server_api_key = 'AIzaSyBP1yHI2Ps6jQ3L7WMAessByWCJ0bJLL2E';
var sender = new gcm.Sender(server_api_key);
var registrationIds = [];

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});


io.sockets.on('connection', function (socket) {
    var roomId;

    socket.on('create room', function(crno){
        console.log("create: "+crno);
        roomId = "cr"+crno;
        socket.join(roomId.toString());
    });

    socket.on('join room', function(crno){

        console.log("join: "+crno);
        roomId = "cr"+crno;
        socket.join(roomId.toString());
    });


    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'

        console.log("crno:"+data['crno']+" senderNo:"+data['senderNo']+ +" "+ data['senderName']+ " "+ data['msg']);
        var message = new gcm.Message({
            //collapseKey: 'demo',
            delayWhileIdle: false,
            //timeToLive: 3,
            data: {
                title: data['senderName'],
                message: data['msg'],
                crno: data['crno'],
                senderNo: data['senderNo']
            }
        });
        //방에있는 token 받아오기
        var tokensArr = JSON.parse(data['tokens']);
        for(var i=0; i<tokensArr.length;i++){
            var token = tokensArr[i]["mtoken"];
            registrationIds.push(token);
        }

        sender.send(message, registrationIds, 4, function (err, result) {
            console.log(result);
        });
        registrationIds.splice(0,registrationIds.length);

        io.sockets.in("cr"+data['crno']).emit('new message', {
            crno: data['crno'],
            mno: data['senderNo'],
            username: data['senderName'],
            message: data['msg']
        });
    });
    socket.on('leave', function(crno) {
      console.log("leave: "+crno);
      roomId = "cr"+crno;
      socket.leave(roomId.toString());
    });





    // when the client emits 'add user', this listens and executes
    //socket.on('add user', function (username) {
    //    if (addedUser) return;
    //
    //    // we store the username in the socket session for this client
    //    socket.username = username;
    //    ++numUsers;
    //    addedUser = true;
    //    socket.emit('login', {
    //        numUsers: numUsers,
    //    });
    //    // echo globally (all clients) that a person has connected
    //    socket.to(roomId).emit('user joined', {
    //        username: socket.username,
    //        numUsers: numUsers
    //    });
    //});
    //
    //// when the client emits 'typing', we broadcast it to others
    //socket.on('typing', function () {
    //    socket.to(roomId).emit('typing', {
    //        username: socket.username
    //    });
    //});
    //
    //// when the client emits 'stop typing', we broadcast it to others
    //socket.on('stop typing', function () {
    //    socket.to(roomId).emit('stop typing', {
    //        username: socket.username
    //    });
    //});
    //
    //// when the user disconnects.. perform this
    //socket.on('disconnect', function () {
    //    if (addedUser) {
    //        --numUsers;
    //
    //        // echo globally that this client has left
    //        socket.to(roomId).emit('user left', {
    //            username: socket.username,
    //            numUsers: numUsers
    //        });
    //    }
    //});
});
