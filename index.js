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
        this.start = start
        this.limit = limit;
    }

    islimit(){
        let islmt = (Date.now()-this.start > this.limit);
        if(islmt){this.start = Date.now()}
        return islmt;
    }
}


app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    process.stdout.write(socket.id+" has joined \n");
    socket.join("default");


    socket.on("disconnect",()=>{
        process.stdout.write(socket.id+" has left \n");
    })
})



server.listen(PORT, () => {
    process.stdout.write(`listening on *:${PORT}`);
  });