var gaim = module.exports = { games: {}, count: 0};

/* Game States */
var STATE_LOBBY = 0,
	STATE_PLAYING = 1,
	STATE_OVER = 2;

gaim.STATE = {
	LOBBY: STATE_LOBBY,
	PLAYING: STATE_PLAYING,
	OVER: STATE_OVER
};

/* Entity Types */
var ENTITY_SHIP = 0,
	ENTITY_PROJECTILE = 1;

var util = require('./util');

gaim.createGame = function(creator) {
	creator.color = '#0000ff';

	// Create the game object
	var game = {
		id: util.guid(),
		host: creator,
		players: [creator],
		state: STATE_LOBBY,
		mapSize: 5,
		ships: [],
		projectiles: [],
		entitySequence: 0,
		moves: {}
	};

	// Add to our games
	this.games[game.id] = game;
	this.count++;

	return game;
};

gaim.joinGame = function(id, player) {
	var game = this.games[id];
	if(game && game.players.length < 2 && game.state == STATE_LOBBY) {
		player.color = '#00ff00';
		game.players.push(player);
	} else {
		game = null;
	}
	return game;
};

gaim.getGameList = function(filter) {
	var games = [];
	for(var g in this.games) {
		if(filter !== undefined && this.games[g].state != filter) {
			continue;
		}
		var gi = {
			id: this.games[g].id,
			host: this.games[g].host,
			state: this.games[g].state,
			count: this.games[g].players.length
		};
		games.push(gi);
	};
	return games;
};

gaim.startGame = function(id) {
	var game = this.games[id];
	if(game) {
		game.state = game.players.length == 2 ? STATE_PLAYING : STATE_LOBBY;
		populateEntities(game);
	}
	return game;
};

gaim.nextTurn = function(id) {
	var game = this.games[id],
		index = 0,
		shipIndex = 0,
		moves = {},
		ship, move, t, d;
	if(game) {
		// Move stuff
		for(shipIndex=0;shipIndex<game.ships.length;shipIndex++) {
			ship = game.ships[shipIndex];
			move = game.moves[ship.id];
			if(move && ship.player == move.playerId && ship.id == move.shipId) {
				t = util.clamp((ship.speed / util.dist(ship, move)),1);
				ship.x = util.lerp(ship.x, move.x, t);
				ship.y = util.lerp(ship.y, move.y, t);
				if(t < 1) {
					moves[ship.id] = move;
				}
			}
		}

		// Store left over moves
		game.moves = moves;
	}
	return game;
};

gaim.addMove = function(gameId, playerId, shipId, x, y) {
	var game = this.games[gameId];
	if(game) {
		// TODO: Verify Ship is owned by Player

		game.moves[shipId] = {
			playerId: playerId,
			shipId: shipId,
			x: x,
			y: y
		};
	}
};

function populateEntities(game) {
	var index = 0;
	for(;index<game.players.length;index++) {
		game.ships.push(createShipEntity(game.players[index], game));
		game.ships.push(createShipEntity(game.players[index], game));
		game.ships.push(createShipEntity(game.players[index], game));
		game.ships.push(createShipEntity(game.players[index], game));
		game.ships.push(createShipEntity(game.players[index], game));
	}
}

function createShipEntity(player, game) {
	return {
		id: game.entitySequence++,
		color: player.color,
		player: player.id,
		speed: 50,
		type: ENTITY_SHIP,
		x: util.randomInt(400),
		y: util.randomInt(400),
		w: 20,
		h: 20
	};
}