var gaim = module.exports = { games: {}, moves: {}, players: {}, count: 0};

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
		players: [creator.id],
		state: STATE_LOBBY,
		mapSize: 5,
		ships: [],
		projectiles: [],
		entitySequence: 1,
		turnTime: 10
	};

	// Add to our games
	this.games[game.id] = game;
	this.moves[game.id] = {};
	this.players[creator.id] = creator;
	this.count++;

	return game;
};

gaim.joinGame = function(id, player) {
	var game = this.games[id];
	if(game && game.players.length < 2 && game.state == STATE_LOBBY) {
		player.color = '#00ff00';
		this.players[player.id] = player;
		game.players.push(player.id);
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

gaim.getPlayersList = function(id) {
	var game = this.games[id],
		players = [],
		index = 0;
	for(;index<game.players.length;index++) {
		players.push(this.players[game.players[index]]);
	}
	return players;
};

gaim.startGame = function(id) {
	var game = this.games[id];
	if(game) {
		game.state = game.players.length == 2 ? STATE_PLAYING : STATE_LOBBY;
		populateEntities(game, this.getPlayersList(id));
	}
	return game;
};

gaim.nextTurn = function(id) {
	var game = this.games[id];
	if(game) {
		this.moves[id] = handleMove(game, this.moves[id]);
		handleCombat(game);
	}
	return game;
};

gaim.addMove = function(gameId, playerId, shipId, x, y) {
	var moves = this.moves[gameId];
	if(moves) {
		// TODO: Verify Ship is owned by Player

		moves[shipId] = {
			playerId: playerId,
			shipId: shipId,
			x: x,
			y: y
		};
	}
};

function populateEntities(game, players) {
	var index = 0;
	for(;index<players.length;index++) {
		game.ships.push(createShipEntity(players[index], game));
		game.ships.push(createShipEntity(players[index], game));
		game.ships.push(createShipEntity(players[index], game));
		game.ships.push(createShipEntity(players[index], game));
		game.ships.push(createShipEntity(players[index], game));
	}
}

function createShipEntity(player, game) {
	return {
		id: game.entitySequence++,
		color: player.color,
		player: player.id,
		speed: 100,
		state: 1,
		type: ENTITY_SHIP,
		hp: 100,
		d: 5,
		r: 100,
		r2: 100*100,
		px: null,
		py: null,
		x: util.randomInt(400),
		y: util.randomInt(400),
		w: 20,
		h: 20,
		target: null
	};
}

function handleMove(game, moves) {
	var index = 0,
		shipIndex = 0,
		nextMoves = {},
		ship, move, t, d;
	// Move stuff
	for(shipIndex=0;shipIndex<game.ships.length;shipIndex++) {
		ship = game.ships[shipIndex];
		move = moves[ship.id];
		if(move && ship.player == move.playerId && ship.id == move.shipId) {
			ship.px = ship.x;
			ship.py = ship.y;
			t = util.clamp((ship.speed / util.dist(ship, move)),1);
			ship.x = util.lerp(ship.x, move.x, t);
			ship.y = util.lerp(ship.y, move.y, t);
			if(t < 1) {
				nextMoves[ship.id] = move;
			}
		} else {
			ship.px = ship.py = null;
		}
	}

	// Return the next set of moves
	return nextMoves;
}

function getShipById(game, id) {
	var index;
	for(index=0;index<game.ships.length;index++) {
		if(game.ships[index].id==id) {
			return game.ships[index];
		}
	}
	return null;
}

function handleCombat(game) {
	var index = 0,
		ship, target;
	for(index;index<game.ships.length;index++) {
		ship = game.ships[index];
		if(ship.hp > 0) {
			acquireTarget(game, ship);
			if(ship.target) {
				target = getShipById(game, ship.target);
				target.hp -= ship.d;
				if(target.hp <= 0) {
					target.state = target.hp = 0;
				}
			}
		}
	}
}

function acquireTarget(game, ship) {
	var index = 0,
		target,
		closest,
		closestDist = ship.r + 1,
		dist;
	if(ship.target) {
		target = getShipById(game, ship.target);
		if(target.hp <= 0) {
			ship.target = null;
		} else {
			// Verify still in range
			dist = util.dist(ship, target);
			if(dist > ship.r) {
				ship.target = null;
			}
		}
	}
	if(!ship.target) {
		for(;index<game.ships.length;index++) {
			target = game.ships[index];
			if(target.player != ship.player && target.hp > 0) {
				dist = util.dist(ship, target);
				if(dist <= ship.r && closestDist > dist) {
					closestDist = dist;
					closest = target;
				}
			}
		}
		if(closest) {
			ship.target = closest.id;
		}
	}
}

