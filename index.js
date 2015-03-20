var express = require('express');
var _ = require('lodash');
var tweets = require('./fixtures').tweets;
var users = require('./fixtures').users;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var shortId = require('shortid');
var passport = require('./auth.js');

var app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

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

app.post('/api/tweets', ensureAuthentication, function(req, res){
	var tweet = req.body.tweet;
	tweet.userId = req.user.id;

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

app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res){
	var tweetId = req.params.tweetId;

	var tweet = _(tweets).findWhere({id: tweetId});

	if(tweet) {
		if(req.user.id !== tweet.userId){
			res.sendStatus(403);
		}
		else {
			var tweetIndex = tweets.indexOf(tweet);
			tweets.splice(tweetIndex, 1);
			return res.status(200)
				.end();
		}
	}
	else {
		return res.send(404)
			.end();
	}
});

app.post('/api/auth/login', function(req, res) {
	passport.authenticate('local', function(err, user){
		if(err){
			res.status(500).end();
		}
		if(!user){
			res.status(403).send();
		}
		else
		{
			req.logIn(user, function(err){
				if(err){
					res.status(500).end();
				}
				else {
					res.send({user: user}).end();
				}
			});
		}
	})(req, res);
});

function ensureAuthentication(req, res, next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		res.status(403)
			.end();
	}
}

var server = app.listen('3000', '127.0.0.1');

module.exports = server;