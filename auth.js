var users = require('./fixtures').users;
var passport = require('passport');
var _ = require('lodash');

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