let socket = io();


function slide(self){
    if(self.nextElementSibling.getAttribute("slide")=="on"){
        self.nextElementSibling.setAttribute("slide","off");
        self.setAttribute("slide","off");
    }else{
        self.nextElementSibling.setAttribute("slide","on");
        self.setAttribute("slide","on");

    }
}

function makeroom(){
    let roomname = document.getElementById("m_roomname").value;
    let roompas = document.getElementById("m_roompas").value;
    let chatroom = document.getElementById("chatroom");


    if(!roomname){return;}
    let roommakediv = document.getElementById("roommakediv");
    roommakediv.style.height = "0px";
    roommakediv.style.padding = "0px";
    let roomjoindiv = document.getElementById("roomjoindiv");
    roomjoindiv.style.height = "0px";
    roomjoindiv.style.padding = "0px";
    chatroom.style.height = "0px";
    chatroom.style.padding = "0rem";
    chatroom.style.display = "flex";
    chatroom.style.visibility = "hidden"
    setTimeout(()=>{
        roommakediv.style.display = "none";
        roomjoindiv.style.display = "none";
        chatroom.style.visibility = "visible"
        chatroom.style.height = "400px";
        chatroom.style.padding = "1rem";


    },1000);




}

function joinroom(){



}

//canvas zeug 

let canvas = document.getElementById("bgcanvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
let ctx = canvas.getContext("2d");
thingarr = [];
mousex = 0;
mousey = 0;

class things{
constructor(x){
    this.x = x;
    this.y = (Math.random()*canvas.height);
    this.reset();
    thingarr.push(this);
}
update(){
    this.y+=this.ya;
    this.x+=this.xa;
    if(this.y>canvas.height+this.size){
        this.reset();
        this.y = 0-this.size;
    }
    if(this.x>canvas.width+this.size){
        this.x = 0-this.size;
    }
    if(this.x<0-this.size){
        this.x = canvas.width+this.size;
    }
    if(distance(this.x,mousex,this.y,mousey)<this.size){
        this.xa-=(this.x-mousex)/10;
    }
}
render(){
    ctx.fillStyle= "black";
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fill();
}
reset(){
    this.ya = randomrange(1,2);
    this.xa = randomrange(-1,1);
    this.size =randomrange(15,40);
    
}
}

for (let i = 0; i < 100; i++) {
    new things(randomrange(0,canvas.width)); 
}

setInterval(()=>{
ctx.clearRect(0,0,canvas.width,canvas.height),
    thingarr.forEach(e => {
        e.update();
        e.render();
    });
},1000/30)


addEventListener("mousemove",(e)=>{
mousex= e.clientX;
mousey= e.clientY;
})

//misc 

function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function distance(x1,x2,y1,y2){
    return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));
}