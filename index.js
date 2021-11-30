const express = require('express');
const http = require('http');
const { stdout } = require('process');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const ratelimit_msgs = 1000;

class ratelimiter {
    constructor(limit= 500,start=Date.now()){
        this.start = start;
        this.limit = limit;
    }

    islimit(){
        let islmt = (Date.now()-this.start > this.limit);
        if(islmt){this.start = Date.now()}
        return islmt;
    }
}

const rooms = [

];

class room{
    constructor(name="none",password=false,creator=null){
        this.name = name;
        this.password = password;
        this.creator = creator;
        rooms.push(this);
    }
}

new room("default");



app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    socket.curroom = null;
    socket.nickname = "Dude"+(Math.round(Math.random()*1000));
    joinroom(socket);
    socket.emit("rooms",getroomnames());



    let roomlimiter = new ratelimiter(5000);
    socket.on("makeroom",(data)=>{
        if(!roomlimiter.islimit()){
            socket.emit("ratelimit",roomlimiter.limit); return;
        }
        if(!data){return;}
        //check ob raum schon da ist;
        let ri = rooms.findIndex(e=>e.name==data.name);
        if(ri!== -1){return;}
        new room(data.name,data.password,socket.id);
        joinroom(socket,data.name,data.password);
        process.stdout.write("room created:" +data.name + " with pass :" + data.password+ " made by "+ socket.nickname+ "\n");
    });

    socket.on("joinroom",data=>{
        joinroom(socket,data.name,data.password);
    })

    socket.on("sendmsg",data=>{
        io.to(socket.curroom).emit("sendmsg",{pre:socket.nickname,msg:data});
    })

    socket.on("sendnick",data=>{
        io.in(socket.curroom).emit("sysmsg",socket.nickname+" has changed their name to "+ data);
        socket.nickname = data;
        io.in(socket.curroom).emit("userlist",getnicknames(socket.curroom));
    })

    socket.on("disconnecting",()=>{
        socket.leave(socket.curroom);
        if(socket.curroom!=="default"){
            io.in(socket.curroom).emit("sysmsg",socket.nickname+" has left");
            io.in(socket.curroom).emit("userlist",getnicknames(socket.curroom));
        }
        io.to("default").emit("rooms",getroomnames());
    })
})

function joinroom(socket,room="default",password=false){

    let index =rooms.findIndex(e=>e.name==room);
    if(index===-1){return "no room";}
    if(rooms[index].password != null && rooms[index].password !== password){return "wrong password";}
    
    if(socket.curroom!==null){socket.leave(socket.curroom)}
    socket.join(room);
    socket.curroom = room;
    socket.emit("joinedroom",room);
    
    io.to("default").emit("rooms",getroomnames());
    if(room!=="default"){
        io.in(room).emit("sysmsg",socket.nickname+" has joined");
        io.in(room).emit("userlist",getnicknames(room));
    }


}


function getnicknames(room) {
    let nicknames = [];
    let clients = io.sockets.adapter.rooms.get(room); 
    if(!clients){return nicknames;}
    for (const clientId of clients) {
        nicknames.push(io.sockets.sockets.get(clientId).nickname);
    }
    return nicknames;
}

function getroomnames(){
    names = [];
    rooms.forEach(e=>{
        let size;
        if(io.sockets.adapter.rooms.get(e.name) == undefined){
            size =0
        }else{
            size = io.sockets.adapter.rooms.get(e.name).size;
        }
        let room = {name:e.name,haspassword:false,count:size};
        if(e.password!=null){room.haspassword=true};
        names.push(room);
    })
    return names;
}


server.listen(PORT, () => {
    process.stdout.write(`listening on *:${PORT} \n`);
  });