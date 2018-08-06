var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
   res.sendfile('index.html');
});

var roomno = 0;
var connections = 0;
io.on('connection', function(socket) {
   connections++;
   console.log(connections+' connections done');
   //Increase roomno 2 clients are present in a room.
   if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1 || (connections%2) != 0){
         roomno++;
   }
   console.log(roomno+' max room alloted');
   socket.join("room-"+roomno);
   //Send this event to everyone in the room.
   io.sockets.in("room-"+roomno).emit('connectToRoom',roomno);

   //Receiving messages from users and sending to the specific rooms.
   socket.on('send_message', function(data){
      console.log(data.my_room_no+' to this roomno');
      io.to('room-'+data.my_room_no).emit('new_message',data.message+'<br>');
   }); 
});

http.listen(port, function() {
   console.log('listening on localhost:3000');
});