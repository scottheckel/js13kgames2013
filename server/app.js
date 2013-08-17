var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  url = require('url'),
  path = require('path'),
  fs = require('fs'),
  gaim = require('./gaim'),
  util = require('./util'),
  gamePort = process.argv[2] || 8080; 

app.listen(gamePort);
console.log("Server started on localhost:" + gamePort);

function handler (req, res) {
  var uri = url.parse(req.url).pathname,
      filename = path.join(process.cwd(), 'client', uri);
  if(fs.statSync(filename).isDirectory()) filename += '/index.html';
  fs.readFile(filename,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + filename);
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