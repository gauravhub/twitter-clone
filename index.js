var express = require('express');
var _ = require('lodash');
var tweets = require('./fixtures').tweets;
var users = require('./fixtures').users;

var app = express();

app.get('/api/tweets', function(req, res){
	var userId = req.query.userId;

	if(!!userId) {
		var userTweets = _.where(tweets, {userId: userId});
			userTweets = _.sortBy(userTweets, function(tweet) { return tweet.created; }).reverse();

		res.status(200)
		   .send({tweets: userTweets})
		   .end();
	}
	else {
		res.status(400)
		   .send('Bad Request')
		   .end();
	}
});

var server = app.listen('3000', '127.0.0.1');

module.exports = server;