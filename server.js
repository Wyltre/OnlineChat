const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on('set username', (username) => {
    if (!users[username]) {
      users[username] = socket.id;
      socket.username = username;
      socket.emit('username set', username);
      io.emit('user list', Object.keys(users));
    } else {
      socket.emit('username exists');
    }
  });

  socket.on('join general', () => {
    socket.join('general');
  });

  socket.on('get users', () => {
    socket.emit('user list', Object.keys(users));
  });

  socket.on('chat message', (data) => {
    if (data.type === 'general') {
      io.to('general').emit('chat message', data);
    } else if (data.type === 'private') {
      if (users[data.id]) {
        io.to(users[data.id]).emit('chat message', data);
        io.to(users[data.user]).emit('chat message', data);
      }
    }
  });

  socket.on('typing', (data) => {
    if (data.type === 'general') {
      socket.broadcast.to('general').emit('display', data);
    } else if (data.type === 'private') {
      if (users[data.id]) {
        socket.to(users[data.id]).emit('display', data);
      }
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];
      io.emit('user list', Object.keys(users));
    }
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
