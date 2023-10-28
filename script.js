var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var users = {}; // Kullanıcı adlarını saklamak için nesne


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  console.log("a user connected");

  socket.on('set username', function(username) {
    if (!users[username]) {
      users[username] = true; // Kullanıcı adı kullanılmıyorsa sakla
      socket.emit('username set', username); // Kullanıcı adını doğrula
    } else {
      socket.emit('username exists'); // Kullanıcı adı kullanılıyorsa hata mesajı gönder
    }
  });

  socket.on('chat message', function(msg) {
    io.emit('chat message', { user: users[socket.id], message: msg });
  });

  socket.on('typing', function(data) {
    socket.broadcast.emit('display', { user: users[socket.id], typing: data.typing });
  });

  socket.on('disconnect', function() {
    delete users[socket.id]; // Kullanıcı bağlantıyı kapatırsa kullanıcı adını sil
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
