var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs'),
  gaim = require('./gaim'),
  util = require('./util'); 

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/../client/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  var updateMessages = function(gameId) {
    var messages = gaim.getMessages(gameId);
    io.sockets.in(gameId).emit('updateMessages', messages);
  };

  var user = {
    id: util.guid(),
    client: socket.id
  };

  socket.emit('connected', user);
  socket.emit('refreshGames', gaim.getGameList());

  socket.on('joinGame', function (data, callback) {
    var game = gaim.joinGame(data.gameId, data.user);
    if(game) {
      socket.join(game.id);
      socket.broadcast.to(game.id).emit('refreshUsersList', game.players);
      callback({'success':true,'game':game});
      updateMessages(game.id);
    } else {
      callback({'success':false});
    }
  });

  socket.on('createGame', function (data, callback) {
    var game = gaim.createGame(data.user);
    if(game) {
      socket.join(game.id);
      callback({'success':true,'game':game});
      updateMessages(game.id);
    } else {
      callback({'success':false});
    }
  });
});