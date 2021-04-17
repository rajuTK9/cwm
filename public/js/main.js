const form=document.getElementById('send-container');
const messageInput=document.getElementById('messageInp');
const messageContainer=document.getElementById('container')

var join=new Audio('sounds/join.mp3')
var send=new Audio('sounds/send.mp3')
var receive=new Audio('sounds/receive.mp3')
var left=new Audio('sounds/left.mp3')
var notify=new Audio('sounds/notify.mp3');

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

const socket=io();


let isMuted=false;
document.getElementById('mute').addEventListener('click', ()=>{
    document.getElementById('mute').classList.toggle('mute');
    if(isMuted) {   isMuted=false;   }
    else {  isMuted=true;   }
})

function audioChecker(track) {
    if(!isMuted) {  track.play();   }
}

//join chat room
socket.emit('joinRoom',{ username ,room });

//Get Room and Users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
});

document.addEventListener('visibilitychange', function() {
    tabProp=document.visibilityState;
});

function notification(name,message) {
    Push.create(name, {
        body: message,
        icon: 'https://img.icons8.com/cute-clipart/35/000000/chat.png',
        timeout: 4000,
        onClick: function () {
            window.focus();
            this.close();
        }
    });
    audioChecker(notify);
}

let toChange=false;
let pff;

function fontChanger(family) {
    pff=family;
    toChange=true;
    
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.style.fontFamily=family;
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function append(message,position,other='') {
    function time(date=new Date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM'; 
        if (hours >= 12) {
            hours= hours-12;
        }
        if(hours < 10) {
            hours= '0'+hours
        }
        if(minutes < 10) {
            return hours+":0"+minutes+" "+ampm;
        }
        else {
            return hours+":"+minutes+" "+ampm;
        }
    }

    const messageElement=document.createElement('div')
    
    messageElement.classList.add('message')
    messageElement.classList.add(position)
    
    if(position=='leave' || position=='join') {
        messageElement.innerText=message
    } 
    else {
        let fieldset=document.createElement('fieldset');
        messageElement.appendChild(fieldset);
        
        let legend=document.createElement('legend');
        
        if(position=='right') {
            legend.innerText='You:';
        }
        else {
            legend.innerText=other+':';
                // document.addEventListener('visibilitychange', function() {
                //     tabProp=document.visibilityState;
                // });
                if(document.visibilityState=='hidden') {
                    notification(other,message)
                }
        }

        fieldset.appendChild(legend);
        
        let p=document.createElement('p');
        p.classList.add('msg-holder');
        if(toChange) {
            p.style.fontFamily=pff;
        }
        p.innerText=message;
        fieldset.appendChild(p)
        
        var time=time();

        let tt=document.createElement('tt');
        tt.innerText=time;
        fieldset.appendChild(tt);
    }

    messageContainer.append(messageElement)

    messageContainer.scrollTop=messageContainer.scrollHeight;

    if(position == 'left') {
        if(document.visibilityState=='visible') {
            audioChecker(receive);
        }
    }
    else if(position == 'right') {
        audioChecker(send);
    }
}

socket.on('user-joined',name=>{
    append(`${name}`,'join')
    if(document.visibilityState=='hidden') {
        notification('New Member',name);
    }
    else {
        audioChecker(join);
    }
})

//message submit
form.addEventListener('submit',(e)=>{
    e.preventDefault()
    const message=messageInput.value;
    append(`${message}`,'right')
    socket.emit('send',message)
    messageInput.value=''
    messageInput.focus();
    
    document.querySelector('.emojionearea-editor').innerText='';
    // document.querySelector('.emojionearea-editor').focus();
})

socket.on('receive',data=>{
    let other=data.name;
    append(`${data.message}`,'left',other);
})

socket.on('left',name=>{
    append(`${name}`,'leave')
    if(document.visibilityState=='hidden') {
        notification('A Member Left',name);
    }
    else {
        audioChecker(left);
    }
})

//Add Room name to DOM
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');
function outputRoomName(room) {
    roomName.innerText=room;
}

//Add Room name to DOM
function outputUsers(users) {
    userList.innerHTML=`
        ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `;
}




let colorPicker=document.getElementById('colorPicker');
const btn=document.getElementById('changebg');
btn.addEventListener('click',()=> {
    colorPicker.classList.toggle('active')
})
// function changebg() {
//     if(colorPicker.style.display=='none') {
//         colorPicker.style.display='inline-block';
//     } else {
//         colorPicker.style.display='none';
//     }
// }



const imgBtn=document.getElementById('image-btn');
const clrBtn=document.getElementById('color-btn');
const fontBtn=document.getElementById('font-btn');

const clrs=document.getElementById('colors');
const image=document.getElementById('images');
const fonts=document.getElementById('fonts');

const tags=document.getElementById('tags');

imgBtn.addEventListener('click',()=> {
    if(tags.classList=='font') {
        tags.classList.toggle('font');
        fonts.classList.toggle('active');
    }
    else if(tags.classList=='clr') {
        tags.classList.toggle('clr');
        clrs.classList.toggle('active');
    } 
    else{
        return;
    }
    tags.classList.toggle('img');
    image.classList.toggle('active');
})

clrBtn.addEventListener('click',()=> {
    if(tags.classList=='img') {
        tags.classList.toggle('img');
        image.classList.toggle('active');
    }
    else if(tags.classList=='font') {
        tags.classList.toggle('font');
        fonts.classList.toggle('active');
    }
    else{
        return;
    }
    tags.classList.toggle('clr');
    clrs.classList.toggle('active');
})

fontBtn.addEventListener('click',()=> {
    if(tags.classList=='clr') {
        tags.classList.toggle('clr');
        clrs.classList.toggle('active');
    } 
    else if(tags.classList=='img') {
        tags.classList.toggle('img');
        image.classList.toggle('active');
    }
    else{
        return;
    }
    tags.classList.toggle('font');
    fonts.classList.toggle('active');
})

let body=document.getElementById('body');

function changeColor(color){
    messageContainer.style.background=color;
    body.style.background=color;
}

function changeImage(url){
    messageContainer.style.background=`url(${url}) no-repeat center center/cover`;
    // body.style.background=color;
}

function aside() {
    const hb=document.getElementById('hb');
    hb.classList.toggle('active');

    const chatMain=document.querySelector('.chat-main');
    chatMain.classList.toggle('active');
    const aside=document.querySelector('.chat-sidebar');
    aside.classList.toggle('active');
}

document.getElementById('sd').addEventListener('click',()=>{
    messageContainer.scrollTop=messageContainer.scrollHeight;
})