var express = require('express');
var _ = require('lodash');
var tweets = require('./fixtures').tweets;
var users = require('./fixtures').users;
var bodyParser = require('body-parser');
var shortId = require('shortid');

var app = express();

app.use(bodyParser.json());

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

app.get('/api/users/:userId', function(req, res){
	var userId = req.params.userId;

	var user = _.findWhere(users, {id: userId});

	if(!!user){
		res.status(200)
			.send({user: user})
			.end();
	}
	else {
		res.status(404)
			.end();
	}
});

app.post('/api/users', function(req, res){
	var user = req.body.user;

	var existingUser = _.findWhere(users, {id: user.id});

	if(!existingUser){
		if(!user.followingIds){
			user.followingIds = [];
		}

		users.push(user);

		res.status(200)
			.send(user)
			.end();
	}
	else {
		res.status(409)
			.end();
	}
});

app.post('/api/tweets', function(req, res){
	var tweet = req.body.tweet;

	tweet.id = shortId.generate();
	tweet.created = Math.floor(new Date() / 1000);

	tweets.push(tweet);

	res.status(200)
		.send({tweet: tweet})
		.end();
});

app.get('/api/tweets/:tweetId', function(req, res){
	var tweetId = req.params.tweetId;

	var tweet = _(tweets).findWhere({id: tweetId});

	if(tweet){
		return res.status(200)
					.send({tweet: tweet})
					.end();
	}
	else{
		return res.status(404)
					.end();
	}
});

app.delete('/api/tweets/:tweetId', function(req, res){
	var tweetId = req.params.tweetId;

	var tweet = _(tweets).findWhere({id: tweetId});

	if(tweet) {
		var tweetIndex = tweets.indexOf(tweet);
		tweets.splice(tweetIndex, 1);
		return res.status(200)
					.end();
	}
	else {
		return res.send(404)
					.end();
	}
});

var server = app.listen('3000', '127.0.0.1');

module.exports = server;