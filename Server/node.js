var fs = require('fs');
var express = require('express');
var http = require('http');
var url = require('url');
var socketio = require('socket.io');
var mysql = require('mysql');


//서버 생성
var app = express();

var server = http.createServer(function(request, response){
    var pathname = url.parse(request.url).pathname;
    
    if(pathname == '/'){ //로그인 페이지
        fs.readFile('client.html', function(error, data){
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(data);
        });
    }
    else if(pathname == '/signup'){ //회원가입
        fs.readFile('signup.html', function(error, data){
            response.writeHead(200, {'Content-Type' : 'text/html'});
            response.end(data);
        });
    }
    else if(pathname == '/wallpaper'){
        fs.readFile('wallpaper.html', function(error, data){
            response.writeHead(200, {'Content-Type' : 'text/html'});
            response.end(data);
        });
    }
}).listen(13000, ()=>{   //서버 오픈
    console.log("Server running at localhost:13000");
});

// DB 불러오기
var client = mysql.createConnection({
    user: 'root',
    password: 'Youngseo0@'
});
client.query('USE identification'); // 유저 정보를 가져옴

//소켓 통신 서버를 만듦
var io = socketio.listen(server);
io.sockets.on('connection', function(socket){
    socket.on('login', function(data){ //로그인
        console.log('Client Send Data: ', data);
        const user = JSON.parse(data);

        client.query('SELECT id, password FROM login WHERE BINARY id=? AND BINARY password=?', [
            user.ID,
            user.password
        ], function(error, result){
            if(error) {
                console.log(error);
                socket.emit('fail');
            }
            if(Object.keys(result).length === 0){
                socket.emit('fail');
            }
            else{
                socket.emit('notice', "Welcome!");
            }
        });
    });

    socket.on('signup', function(data){ //회원 가입
        console.log('Client Sign Up Data: ', data);
        const user = JSON.parse(data);

        client.query('INSERT INTO login (id, password, email) VALUES (?, ?, ?)', [
            user.ID, user.password, user.email
        ], function(error){
            if(error){
                console.log(error);
                socket.emit('fail');
            }
            else{
                socket.emit('isOkay');
            }
        });

        fs.mkdirSync(__dirname+'/'+user.ID, function(error){
            if(error){
                console.log(error);
            }
        })
    });

    socket.on('collect', function(data){ // collector
        console.log('Collect Wallpaper');
        
    });
});