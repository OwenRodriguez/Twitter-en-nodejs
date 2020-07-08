'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    tweets: [{type: Schema.Types.ObjectId, ref:'tweet'}],
    followers:[{type:Schema.Types.ObjectId,ref:'user'}],
    following:[{type:Schema.Types.ObjectId,ref:'user'}]
});

module.exports = mongoose.model('user', userSchema);