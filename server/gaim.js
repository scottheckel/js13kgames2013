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
var ENTITY_PLANET = 0,
	ENTITY_SHIP = 1;

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
		planetCount: 10,
		entities: {},
		entitySequence: 0
	};

	// Add to our games
	this.games[game.id] = game;
	this.count++;

	return game;
};

gaim.joinGame = function(id, player) {
	var game = this.games[id];
	if(game && game.players.length < 2) {
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

gaim.hasEntity = function(game, entityType, x, y) {
	var entities = game.entities,
		index = 0;
	for(;index<entities.length;index++) {
		if(entities[index].type == entityType && entities[index].x == x && entities[index].y == y) {
			return true;
		}
	}
	return false;
};

gaim.startGame = function(id) {
	var game = this.games[id];
	game.state = game.players.length == 2 ? STATE_PLAYING : STATE_LOBBY;
	return game;
};