var passport = require('passport');
var _ = require('lodash');
var localStrategy = require('passport-local').Strategy;
var connection = require('./db');
var User = connection.model('User');
var bcrypt = require('bcrypt');

passport.use(new localStrategy(function(username, password, done){
    User.findOne({id: username}, function(err, user){
        if(user){
            bcrypt.compare(password, user.password, function(err, result){
                if(result){
                    done(null, user);
                }
                else {
                    done(null, false, {message: 'Incorrect password.'});
                }
            });
        }
        else{
            done(null, false, { message: 'Incorrect username.' });
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({id:id}, function(err, user){
        if(user){
            return done(null, user);
        }
        else {
            done(null, false);
        }
    });
});

module.exports = passport;