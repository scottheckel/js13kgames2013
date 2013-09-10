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
  if(fs.exists(filename, function(exists) {
    if(!exists) {
      res.writeHead(404);
      return res.end('File not found: ' + filename);
    }
    if(fs.statSync(filename).isDirectory()) filename += '/index.html';
    fs.readFile(filename,
      function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading ' + filename);
        }

        res.writeHead(200);
        res.end(data);
      }
    );
  }));
}

io.sockets.on('connection', function (socket) {
  var user = {
    id: util.guid(),
    client: socket.id
  };

  socket.emit('connected', user);
  socket.emit('refreshGames', gaim.getGameList(gaim.STATE.LOBBY));

  socket.on('joinGame', function (data, callback) {
    var game = gaim.joinGame(data.gameId, data.user);
    if(game) {
      socket.join(game.id);
      socket.broadcast.to(game.id).emit('refreshUsersList', game.players);
      callback({'success':true,'game':game});
    } else {
      callback({'success':false});
    }
  });

  socket.on('createGame', function (data, callback) {
    var game = gaim.createGame(data.user);
    if(game) {
      socket.join(game.id);
      callback({'success':true,'game':game});
    } else {
      callback({'success':false});
    }
  });

  socket.on('startGame', function (data) {
    var game = gaim.startGame(data.gameId);
    io.sockets.in(game.id).emit('gameStarted', {'game':game});
  });

  socket.on('turnNext', function(data) {
    if(data.host) {
      var game = gaim.nextTurn(data.gameId);
      if(game) {
        io.sockets.in(game.id).emit('turnComplete', {'ships':game.ships});
      }
    }
  });

  socket.on('g/move', function(data) {
    gaim.addMove(data.id, data.playerId, data.shipId, data.x, data.y);
  });

  socket.on('requestGames', function(data, callback) {
    callback(gaim.getGameList(gaim.STATE.LOBBY));
  });
});