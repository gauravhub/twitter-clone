var users = require('./fixtures').users;
var passport = require('passport');
var _ = require('lodash');
var localStrategy = require('passport-local').Strategy;

passport.use(new localStrategy(function(username, password, done){
    var user = _.findWhere(users, {id: username});
    if(user){
        if(user.password === password){
            done(null, user);
        }
        else{
            done(null, false, { message: 'Incorrect password.' });
        }
    }
    else{
        done(null, false, { message: 'Incorrect username.' });
    }
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var user = _.findWhere(users, {id: id});
    if(user){
        return done(null, user);
    }
    else {
        done(null, false);
    }
});

module.exports = passport;