var mongoose = require('mongoose');
var config = require('../config');
var userSchema = require('./schemas/user.js');
var tweetSchema = require('./schemas/tweet.js');

var connection = mongoose.createConnection(
                'mongodb://' + config.get('database:host') +
                ':' + config.get('database:port') +
                '/' + config.get('database:name') +'');

connection.model('User', userSchema);
connection.model('Tweet', tweetSchema);

module.exports = connection;