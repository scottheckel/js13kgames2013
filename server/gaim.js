var gaim = module.exports = { games: {}, messages: {}, count: 0};

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

gaim.createMessage = function(gameId, message, sender, to) {
	this.messages[gameId].push({
		msg: message,
		from: sender,
		to: to
	});
};

gaim.getMessages = function(gameId, playerId) {
	return this.messages[gameId];
};

gaim.createGame = function(creator) {
	// Create the game object
	var game = {
		id: util.guid(),
		host: creator,
		players: [creator],
		state: STATE_LOBBY,
		mapSize: 5,
		planetCount: 8,
		entities: {},
		entitySequence: 0
	};

	// Add to our games
	this.games[game.id] = game;
	this.messages[game.id] = [];
	gaim.createMessage(game.id, "Game created.");
	gaim.createMessage(game.id, creator.id + " joined the game.");
	this.count++;

	return game;
};

gaim.joinGame = function(id, player) {
	var game = this.games[id];
	if(game) {
		game.players.push(player);
		gaim.createMessage(game.id, player.id + " joined the game.");
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

gaim.startGameCreatePlanets = function(game) {
	var index = 0,
		max = game.mapSize * 2 + 1,
		entity,
		x,
		y;
	for(;index<game.planetCount;index++) {
		do {
			x = util.randomInt(max) - game.mapSize;
			y = util.randomInt(max) - game.mapSize;
		} while(Math.abs(x+y)>game.mapSize || this.hasEntity(game, ENTITY_PLANET, x, y));
		entity = {
			id: game.entitySequence++,
			x: x,
			y: y,
			type: ENTITY_PLANET
		};
		game.entities[entity.id] = entity;
	}
};

gaim.startGame = function(id) {
	var game = this.games[id];
	this.startGameCreatePlanets(game);
	game.state = STATE_PLAYING;
	gaim.createMessage(game.id, "The game has started.");
	return game;
};