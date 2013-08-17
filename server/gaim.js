var gaim = module.exports = { games: {}, count: 0};

var STATE_LOBBY = 0,
	STATE_PLAYING = 1,
	STATE_OVER = 2;

var util = require('./util');

gaim.createGame = function(creator) {
	// Create the game object
	var game = {
		id: util.guid(),
		host: creator,
		players: [creator],
		state: STATE_LOBBY
	};

	// Add to our games
	this.games[game.id] = game;
	this.count++;

	return game;
};

gaim.joinGame = function(id, player) {
	var game = this.games[id];
	if(game) {
		game.players.push(player);
	}
	return game;
};

gaim.getGameList = function() {
	var games = [];
	for(var g in this.games) {
		console.log(this.games[g].id);
		var gi = {
			id: this.games[g].id,
			host: this.games[g].host,
			state: this.games[g].state
		};
		games.push(gi);
	};
	return games;
};