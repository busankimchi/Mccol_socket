var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

var socket = require('socket.io');
var io = socket(server);


/*
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
*/

const NON = -1;
const BANANA = 0;
const LIME = 1;
const STRAWBERRY = 2;
const PLUM = 3;

// banana, lime, strawberry, plum
var fruitList = [0, 0, 0, 0];
var total = 1;

// connection event handler
io.on('connection', function (socket) {

    function score() {
        var scoreList = {};
        var allSockets = io.sockets.sockets;

        for (var socketId in allSockets) {
            var sock = allSockets[socketId];
            console.log(`${sock.name} ${sock.score}`);
            scoreList[sock.name] = sock.score;
        }
        console.log(scoreList);

        return scoreList;
    };

    socket.on('login', function (name) {
        console.log('Client logged-in!\t id:' + name);

        socket.name = name;
        socket._id = total++;
        socket.score = 0;
        socket.currFruit = NON;
        socket.currNumber = 0;
        socket.flag = true;

        io.emit('connected', `unique id : ${socket.id}, welcome ${socket.name}`);
        io.emit('score', score());
    });


    socket.on('bell', function () {
        console.log('bell ring ring ring~~~');

        var flag = false;
        var msg = `\'${socket.name}\' `;

        console.log(`her herer asasdf sadf das ${fruitList}`);

        for (var i = 0; i < 4; i++) {
            if (fruitList[i] == 5) {
                flag = true;
                break;
            }
        }

        if (flag) {
            if (socket.flag) {
                socket.score += 5;
                msg += "wins!! +5 points";

                var allSockets = io.sockets.sockets;
                for (var socketId in allSockets) {
                    var sock = allSockets[socketId];
                    sock.flag = false;
                }
            }
            else {
                msg += "miss!!!";
            }
        }
        else {
            if (socket.flag) {
                socket.score -= 3;
                msg += "miss.. -3 point";

                var allSockets = io.sockets.sockets;
                for (var socketId in allSockets) {
                    var sock = allSockets[socketId];
                    sock.flag = false;
                }
            }
            else {
                msg += "safe!!!";
            }

        }

        console.log(`${socket.id} ${socket.name} ${socket.score}`);
        console.log(msg);

        io.emit('refresh', "");
        io.emit('score', score());
        io.emit('result', msg);
    });

    //data : now fruit/num
    socket.on('card', function (data) {
        console.log('card flipped!!!');
        console.log(data);

        if (data.toString() == "false") {
            data = "b0";
            socket.flag = true;
            fruitList = [0, 0, 0, 0];
            socket.currNumber = 0;
        }

        else {
            console.log(`111111111111111111111122 ${fruitList}`);
            var fruit = NON;
            switch (data[0]) {
                case "b": fruit = BANANA; break;
                case "g": fruit = LIME; break;
                case "s": fruit = STRAWBERRY; break;
                case "p": fruit = PLUM; break;
            }

            const number = Number(data[1]);

            console.log(`${socket.currFruit} ${socket.currNumber}`)

            fruitList[socket.currFruit] -= socket.currNumber;
            fruitList[fruit] += number;

            socket.currFruit = fruit;
            socket.currNumber = number;

            console.log(`11111111111111111111111 ${fruitList}`);
            console.log(`${socket.id} ${socket.name} ${socket._id} ${socket.score}`);
        }

        //io.emit('card', );
    });



    /*
    socket.on('chat', function (data) {
        console.log('Message from %s: %s', socket.name, data.msg);

        var msg = {
            from: {
                name: socket.name,
                userid: socket.userid
            },
            msg: data.msg
        };

        // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
        socket.broadcast.emit('chat', msg);

        // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
        // socket.emit('s2c chat', msg);

        // 접속된 모든 클라이언트에게 메시지를 전송한다
        // io.emit('s2c chat', msg);

        // 특정 클라이언트에게만 메시지를 전송한다
        // io.to(id).emit('s2c chat', data);
    });

    */

    // force client disconnect from server
    socket.on('forceDisconnect', function () {
        socket.disconnect();
    })

    socket.on('disconnect', function () {
        console.log('user disconnected: ' + socket.name);
        total--;
        fruitList[socket.currFruit] -= socket.currNumber;
        io.emit('score', score());
    });
});

server.listen(80, function () {
    console.log('Socket IO server listening on port 80');
});