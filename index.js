var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('./auth.js');
var config = require('./config');

var connection = require('./db');
var User = connection.model('User');
var Tweet = connection.model('Tweet');

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

	if(userId) {
		Tweet.find({userId: userId}, null, {sort: {created: -1}}, function(err, tweets){
			if(err){
				res.sendStatus(500);
			}
			else{
				userTweets = _.map(tweets, function(tweet){
					return tweet.toClient();
				});

				console.log(userTweets);
				res.status(200).send({tweets: userTweets}).end();
			}
		});
	}
	else{
		res.sendStatus(400);
	}
});

app.get('/api/users/:userId', function(req, res){
	var userId = req.params.userId;

	User.findOne({id: userId}, function(err, user){
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
});

app.post('/api/users/:userId', function(req, res){
	var userId = req.params.userId;

	User.findOneAndUpdate({id: userId}, req.body,  function(err, user){
		if(user){
			res.sendStatus(200);
		}
		else{
			res.sendStatus(404);
		}
	});
});

app.post('/api/users', function(req, res){
	var user = req.body.user;

	User.create(user, function(err, user){
		if(err){
			if (err.code === 11000) {
				res.sendStatus(409);
			}
			else {
				res.sendStatus(500);
			}
		}
		else{
			req.logIn(user, function(err){
				if(err){
					res.status(500).end();
				}
				else {
					res.status(200).send({user: user}).end();
				}
			});
		}
	});
});

app.post('/api/tweets', ensureAuthentication, function(req, res){
	var tweet = req.body.tweet;
	tweet.userId = req.user.id;
	tweet.created = Math.floor(new Date() / 1000);

	Tweet.create(tweet, function(err, tweet){
		if(tweet){
			res.status(200).send({tweet:tweet.toClient()}).end();
		}
		else{
			res.sendStatus(500);
		}
	});
});

app.get('/api/tweets/:tweetId', function(req, res){
	var tweetId = req.params.tweetId;

	Tweet.findById(tweetId, function(err, tweet){
		if(err){
			res.sendStatus(500);
		}
		else{
			if(tweet){
				return res.status(200)
					.send({tweet: tweet.toClient()})
					.end();
			}
			else{
				return res.status(404)
					.end();
			}
		}
	});
});

app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res){
	var tweetId = req.params.tweetId;

	Tweet.findById(tweetId, function(err, tweet){
		if(!tweet){
			return res.sendStatus(404);
		}

		if(req.user.id !== tweet.userId){
			return res.sendStatus(403);
		}

		Tweet.findByIdAndRemove(tweetId, function(err){
			if(err){
				return res.sendStatus(500);
			}
			else{
				return res.sendStatus(200);
			}
		});
	});
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

app.post('/api/auth/logout', function(req, res){
	req.logOut();
	res.sendStatus(200);
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

var server = app.listen(config.get("server:port"), config.get("server:hostname"));

module.exports = server;