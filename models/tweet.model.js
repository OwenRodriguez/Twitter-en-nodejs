'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema

var tweetSchema = Schema({
    bodyTweet: String
});

module.exports = mongoose.model('tweet', tweetSchema);