const http=require('http');
const path=require('path');
const express = require('express');
const socketio = require('socket.io')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utils/users');

const app = express();
const server=http.createServer(app);
const io =socketio(server);

// set static folder
app.use(express.static(path.join(__dirname,'public')));

// Run when get connection
io.on('connection', socket => {

    socket.on('joinRoom',({username,room})=>{
        const user=userJoin(socket.id,username,room);

        socket.join(user.room)

        socket.broadcast.to(user.room).emit('user-joined', `${user.username} joined`);
        
        // Send User and Room information
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });

    //listen for a send
    socket.on('send',message=>{
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('receive',{message: message, name: user.username});
    })
    
    // when a user dis-connect
    socket.on('disconnect',()=>{
        const user =  userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('left',`${user.username} left`);

            // Send User and Room information
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        }
    })
});

const PORT =process.env.PORT || 3000;
server.listen(PORT,()=>
    console.log(`Server is running on PORT: ${PORT}`)
);