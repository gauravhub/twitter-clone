var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
    id: { type: String, unique: true },
    name: String,
    email: { type: String, unique: true },
    password: String,
    followingIds: { type: [String], default: [] }
});

userSchema.pre('save', function(next){
    var self = this;
    bcrypt.genSalt(10, function(err, salt){
        if (err) return next(err);
        bcrypt.hash(self.password, salt, function(err, hash){
            if (err) return next(err);
            self.password = hash;
            next();
        });
    });
});

module.exports = userSchema;