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
  /*var joinGame = function(gameName, user) {
    games[gameName].users.push(user);
    return true;
  };
  var createGame = function(gameName, creator) {
    games[gameName] = {
      'name': gameName,
      'creator': creator,
      'users': [creator]
    };
    socket.emit('refresh-games-list', games);
    return true;
  };

  socket.emit('refresh-games-list', games);
  */
  var user = {
    id: util.guid()
  };

  socket.emit('connected', user);
  socket.emit('refreshGames', gaim.getGameList());

  socket.on('joinGame', function (data, callback) {
    var game = gaim.joinGame(data.gameId, data.user);
    if(game) {
      socket.join(game.id);
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
});