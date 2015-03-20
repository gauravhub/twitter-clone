var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var tweetSchema = new Schema({
    userId: String,
    created: Number,
    text: String
});

tweetSchema.methods.toClient = function(){
  return {
      id: this._id,
      text: this.text,
      userId: this.userId,
      created: this.created
  };
};

module.exports = tweetSchema;