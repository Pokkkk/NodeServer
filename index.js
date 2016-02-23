var express = require('express');
var app = express();
var gcm = require('node-gcm');
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
////////
var message = new gcm.Message();
var server_api_key = 'AIzaSyD3leDcMuediChhoKuUwh-tog17lhFFVgI';
var sender = new gcm.Sender(server_api_key);
var registrationIds = [];
////////

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
//app.use(express.static(__dirname + '/public'));

// Chatroom

//var numUsers = 0;



io.sockets.on('connection', function (socket) {
    //var addedUser = false;
    //console.log(roomNum);
    var roomId;

    socket.on('create room', function(crno){
        console.log("create: "+crno);
        roomId = "cr"+crno;
        socket.join(roomId.toString());
        console.log("roomList: "+ io.sockets.adapter.rooms);
        console.log("created");
    });

    socket.on('join room', function(crno){

        console.log("join: "+crno);
        roomId = "cr"+crno;
        socket.join(roomId.toString());
        console.log("id: "+ socket.id);
    });


    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'

        console.log(data['crno']+data['senderNo']+data['senderName']+data['msg']
                    +data['tokens']);
        var message = new gcm.Message({
            collapseKey: 'demo',
            delayWhileIdle: true,
            timeToLive: 3,
            data: {
                title: data['senderName'],
                message: data['msg'],
                custom_key1: 'custom data1',
                custom_key2: 'custom data2'
            }
        });
        //방에있는 token 받아오기
        for(token:data['tokens']){
          console.log(token);
          //registrationIds.push(token);
        }
        sender.send(message, registrationIds, 4, function (err, result) {
            console.log(result);
        });


        io.sockets.in("cr"+data['crno']).emit('new message', {
            crno: data['crno'],
            mno: data['senderNo'],
            username: data['senderName'],
            message: data['msg']
        });
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

//var message = new gcm.Message();

// var message = new gcm.Message({
//     collapseKey: 'demo',
//     delayWhileIdle: true,
//     timeToLive: 3,
//     data: {
//         title: 'Bit-Talk',
//         message: '빗톡왔어요',
//         custom_key1: 'custom data1',
//         custom_key2: 'custom data2'
//     }
// });

//var server_api_key = 'AIzaSyD3leDcMuediChhoKuUwh-tog17lhFFVgI';
//var sender = new gcm.Sender(server_api_key);
//var registrationIds = [];

// var token = 'cJVVkpPRznw:APA91bEEx-AyhIH9iHiXnRpidh10I9ADCGE6LJAk1Xx0egc8E0_DeK6q3B-zFY-RrPMUIMCdt8MLi-7zg1Ete6umPwU7Oflnx6ROLdHa_DtyhEV6I7S7bqkSMdXsCUm3cOHnmH6fwn96';
// registrationIds.push(token);

// sender.send(message, registrationIds, 4, function (err, result) {
//     console.log(result);
// });
