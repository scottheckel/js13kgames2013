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
  var gameId = null,
      user = {
        id: util.guid(),
        name: randomName(),
        client: socket.id
      };

  socket.emit('connected', user);
  socket.emit('refreshGames', gaim.getGameList(gaim.STATE.LOBBY));

  socket.on('disconnect', function() {
    if(gameId) {
      var result = gaim.disconnect(gameId, user.id);
      socket.broadcast.to(gameId).emit('g/disconnect', result);

      // If the game is quitting, remove everyone from the room
      if(result.quit) {
        removeAllClientsFromGame(gameId);
      }
    }
  });

  socket.on('joinGame', function (data, callback) {
    var game = gaim.joinGame(data.gameId, user),
        players;
    if(game) {
      gameId = game.id;
      players = gaim.getPlayersList(game.id);

      socket.join(game.id);
      socket.broadcast.to(game.id).emit('refreshUsersList', players);
      callback({'success':true,'game':game,'players':players});
    } else {
      callback({'success':false});
    }
  });

  socket.on('createGame', function (data, callback) {
    var game = gaim.createGame(user),
        players;
    if(game) {
      gameId = game.id;
      players = gaim.getPlayersList(game.id);

      socket.join(game.id);
      callback({'success':true,'game':game,'players':players});
    } else {
      callback({'success':false});
    }
  });

  socket.on('startGame', function (data) {
    var game = gaim.startGame(data.gameId),
        players = gaim.getPlayersList(data.gameId);
    io.sockets.in(game.id).emit('gameStarted', {'game':game,'players':players});
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
    gaim.addMove(data.id, user.id, data.shipId, data.x, data.y);
  });

  socket.on('g/ready', function(data, callback) {
    var game = gaim.setReady(data.id, user.id, data.ready);
    if(game) {
      io.sockets.in(game.id).emit('g/readied', { 'ready': game.ready });
      callback({'success':true});
    } else {
      callback({'success':false});
    }
  });

  socket.on('g/leave', function(data) {
    // Leave the game room
    gameId = null;
    socket.leave(data.gameId);

    // Disconnect from game
    var result = gaim.disconnect(data.gameId, user.id);
    socket.broadcast.to(data.gameId).emit('g/disconnect', result);

    // If the game is quitting, remove everyone from the room
    if(result.quit) {
      removeAllClientsFromGame(data.gameId);
    }
  });

  socket.on('requestGames', function(data, callback) {
    callback(gaim.getGameList(gaim.STATE.LOBBY));
  });
});

function removeAllClientsFromGame(gameId) {
  io.sockets.clients(gameId).forEach(function(user) {
    user.leave(gameId);
  });
}

function randomName() {
  var words = [
    'Cat','Dog','Bird','Pig','Horse','Monkey','Giraffe','Elephant','Rhino','Badger','Turtle','Panther','Spider','Tortuga',
    'Green','Orange','Steel','Grey','Red','Crimson','Midnight','Concrete','Blue','Yellow','Golden','Brown','Black','Pink',
    'Running','Sitting','Laughing','Plodding','Fleeting','Sneaky','Snoring','Boring',
    'North','South','East','West','Downtown','Carolina','Dakota','York','Nevada','Washington','California','Iowa','Ohio','Michigan','Minnesota','Wisconsin','Hampshire','Falls','Edwards','Franklin','Athens','Oak','Bern','Berlin','London','Shanghai','Paris','Rio','Seattle','Tokyo',
    'Baby','Object','Car','Sporty','Mountain','Cable','Semi','Paint','Time','VHS','Coffeee','Tea','Trunk','Chair','Shoe','Grand','Gum','Saint',
    'Hot','Cold','Small','Big','Salty'
  ];
  return words[util.randomInt(words.length)]+words[util.randomInt(words.length)]+util.randomInt(1000);  
}