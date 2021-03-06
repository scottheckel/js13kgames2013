var gaim = module.exports = { games: {}, moves: {}, players: {}, fleets: {}, count: 0};

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


var SHIP_BATTLESHIP = 'b',
	SHIP_CORVETTE = 'c',
	SHIP_FIGHTER = 'f';

var SHIP_COST_BATTLESHIP = 200,
	SHIP_COST_CORVETTE = 100,
	SHIP_COST_FIGHTER = 100;

var MAX_COST = 1000;

var util = require('./util');

gaim.createGame = function(creator) {
	creator.color = '#0000ff';

	// Create the game object
	var game = {
		id: util.guid(),
		host: creator,
		players: [creator.id],
		ready: [creator.id],
		state: STATE_LOBBY,
		ships: [],
		attacks: [],
		entitySequence: 1,
		turnTime: 10
	};

	// Add to our games
	this.games[game.id] = game;
	this.moves[game.id] = {};
	this.fleets[game.id] = {};
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

gaim.disconnect = function(id, playerId) {
	var game = this.games[id],
		player = this.players[playerId],
		name = player ? player.name : 'Unknown',
		forceQuitGame = false,
		message = null;

	if(game) {
		// Unset the player
		delete this.players[playerId];
		util.remove(game.ready, playerId);
		util.remove(game.players, playerId);
		
		if(game.host.id == playerId) {
			// Host left
			forceQuitGame = true;
			message = 'The host ' + name + ' left the game and the game will now end.';
		} else if(game.state == STATE_PLAYING) {
			// Player left during game
			forceQuitGame = true;
			message = name + ' left the game and the game will now end.';
		} else {
			// Player left in the lobby or other ok to leave state
			message = name + ' left the game.';
		}

		// Quitting the game let's drop everything out
		if(forceQuitGame) {
			delete this.games[id];
			delete this.moves[id];
			delete this.fleets[id];
			this.count--;
		}
	}

	return {
		'quit': forceQuitGame,
		'playerId': playerId,
		'msg': message,
		'game': this.games[id],
		'players': forceQuitGame ? null : this.getPlayersList(id)
	};
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
	if(game) {
		for(;index<game.players.length;index++) {
			players.push(this.players[game.players[index]]);
		}
	}
	return players;
};

gaim.setReady = function(id, playerId, ready, fleet) {
	var game = this.games[id];
	if(game) {
		if(ready) {
			if(MAX_COST >= (fleet.bs * SHIP_COST_BATTLESHIP + fleet.cv * SHIP_COST_CORVETTE + fleet.ft * SHIP_COST_FIGHTER)) {
				game.ready.push(playerId);
				this.fleets[id][playerId] = fleet;
			} else {
				return null;
			}
		} else {
			util.remove(game.ready, playerId);
		}
	}
	return game;
};

gaim.startGame = function(id, fleet) {
	var game = this.games[id];
	if(game) {
		if(game.players.length == 2 && game.ready.length == game.players.length && MAX_COST >= (fleet.bs * SHIP_COST_BATTLESHIP + fleet.cv * SHIP_COST_CORVETTE + fleet.ft * SHIP_COST_FIGHTER)) {
			game.state = STATE_PLAYING;
			game.ready = [];
			this.fleets[id][game.host.id] = fleet;
			populateEntities(game, this.getPlayersList(id), this.fleets[id]);
		} else {
			game.state = STATE_LOBBY;
		}
	}
	return game;
};

gaim.nextTurn = function(id) {
	var game = this.games[id],
		winningPlayer;
	if(game) {
		// TODO: Are all ships dead for a player then end game
		handleDying(game);
		this.moves[id] = handleMove(game, this.moves[id]);
		handleCombat(game);
		checkForWin(game);
	}
	return game;
};

gaim.addMove = function(gameId, playerId, shipId, x, y) {
	var moves = this.moves[gameId],
		game = this.games[gameId];
	if(moves && game) {
		var ship = getShipById(game, shipId);
		if(ship && ship.player == playerId) {
			moves[shipId] = {
				playerId: playerId,
				shipId: shipId,
				x: x,
				y: y
			};
		}
	}
};

function populateEntities(game, players, fleets) {
	var index = 0, j, fleet;
	for(;index<players.length;index++) {
		fleet = fleets[players[index].id];
		if(fleet) {
			for(j = 0;j<fleet.bs;j++) {
				game.ships.push(createShipEntity(players[index], game, SHIP_BATTLESHIP));
			}
			for(j = 0;j<fleet.cv;j++) {
				game.ships.push(createShipEntity(players[index], game, SHIP_CORVETTE));
			}
			for(j = 0;j<fleet.ft;j++) {
				game.ships.push(createShipEntity(players[index], game, SHIP_FIGHTER));
			}
		}
	}
}

function createShipEntity(player, game, type) {
	var hp, damage, range, speed, dodge, w, h;

	switch(type) {
		case 'b':
			hp = 200;
			damage = 10;
			range = 300;
			speed = 50;
			dodge = 0.1;
			w = 30;
			h = 30;
			break;
		case 'f':
			hp = 100;
			damage = 3;
			range = 125;
			speed = 150;
			dodge = 0.6;
			w = 10;
			h = 10;
			break;
		case 'c':
			hp = 150;
			damage = 5;
			range = 200;
			speed = 100;
			dodge = 0.2;
			w = 20;
			h = 20;
			break;
	} 

	return {
		id: game.entitySequence++,
		color: player.color,
		player: player.id,
		v: speed,
		state: 2,
		type: ENTITY_SHIP,
		hp: hp,
		mHp: hp,
		d: damage,
		o: dodge,
		r: range,
		r2: range*range,
		px: null,
		py: null,
		t: type,
		x: util.randomInt(800),
		y: util.randomInt(800),
		w: w,
		h: h,
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
			t = util.clamp((ship.v / util.dist(ship, move)),1);
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

function handleDying(game) {
	var index = 0;
	for(;index<game.ships.length;index++) {
		if(game.ships[index].state == 1) {
			game.ships[index].state = 0;
		}
	}
}

function checkForWin(game) {
	var index = 0,
		hasShips = {};
	for(;index<game.ships.length;index++) {
		hasShips[game.ships[index].player] |= game.ships[index].state > 1;
	}
	for(index=0;index<game.players.length;index++) {
		if(!hasShips[game.players[index]]) {
			game.state = STATE_OVER;
			game.winner = game.players[index];
		}
	}
}

function handleCombat(game) {
	var index = 0,
		ship, target, damage;
	game.attacks = [];
	for(;index<game.ships.length;index++) {
		ship = game.ships[index];
		if(ship.state > 0) {
			acquireTarget(game, ship);
			if(ship.target) {
				target = getShipById(game, ship.target);
				
				// Determine Damage
				damage = util.random() < ship.o ? 0 : ship.d;

				// Push onto list of attacks
				game.attacks.push({
					s: ship.id,
					t: ship.target,
					d: damage
				});

				// Remove the hp from the ship
				target.hp -= damage;

				// Set to dying if dead
				if(target.hp <= 0) {
					target.state = 1;
					target.hp = 0;
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

