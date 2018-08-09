var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var xssFilters = require('xss-filters');
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
   if((connections%2) != 0){
         roomno++;
         console.log(roomno+' max room alloted');
         // If room is joined send the user waiting message.
         if(socket.join("room-"+roomno)){
             io.to('room-'+roomno).emit('wait_for_the_user', 'Finding for someone to talk');
            console.log('room joined');
         }
   }else{
         console.log(roomno+' max room alloted');
         // If room is joined send the user waiting message.
         if(socket.join("room-"+roomno)){
             io.to('room-'+roomno).emit('user_found', 'You are talking to a stranger ! Say hi... <button onclick="disconnect()">Find new</button>');
            console.log('room joined');
         }
   }

   // Code for Typing event handler.
   socket.on('i_am_typing',function(data){
      io.to('room-'+data.my_room_no).emit('he_is_typing', {his_id: data.my_id});
   }) 

   //Send this event to everyone in the room.
   io.sockets.in("room-"+roomno).emit('connectToRoom',roomno);

   socket.on('disconn', function(data){
      console.log('disconnected');
      io.to('room-'+data.my_room_no).emit('disconnected', 'Stranger might disconnected <button onclick="disconnect()">Find new</button>');
   });

   //Receiving messages from users and sending to the specific rooms.
   socket.on('send_message', function(data){
      var msg = xssFilters.inHTMLData(data.message);
      msg = msg+'<br>';
      console.log(data.my_room_no+' to this roomno');
      console.log(data.my_id);
      io.to('room-'+data.my_room_no).emit('new_message',{my_id: data.my_id, msg: msg });
   }); 
});

http.listen(port, function() {
   console.log('listening on localhost:3000');
});
   