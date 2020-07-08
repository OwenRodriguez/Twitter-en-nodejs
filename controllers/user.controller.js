'use strict'

var User = require('../models/user.model');
var Tweet = require('../models/tweet.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var idUser = require('../middlewares/authenticated');

function commands(req, res) {
    var user = new User();
    var params = req.body;
    var arrUserData = Object.values(params);
    var reply = arrUserData.toString().split(" ");

    if (reply[0] == 'REGISTER') {
        if (reply[1] != null && reply[2] != null && reply[3] != null && reply[4] != null) {

            User.findOne({ $or: [{ email: reply[2] }, { username: reply[3] }] }, (err, userFind) => {
                if (err) {
                    res.status(500).send({ message: 'Error in the server' });
                } else if (userFind) {
                    res.send({ message: 'User or email alredy registered' });
                } else {
                    user.name = reply[1];
                    user.email = reply[2];
                    user.username = reply[3];
                    user.password = reply[4];
                    bcrypt.hash(reply[4], null, null, (err, hashpass) => {
                        if (err) {
                            res.status(500).send({ message: 'Error when encrypting password' });
                        } else {
                            user.password = hashpass;
                            user.save((err, userSaved) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error in the server' });
                                } else if (userSaved) {
                                    res.send({ user: userSaved })
                                } else {
                                    res.status(404).send({ message: 'Error when save user' });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.send({ message: 'Enter all the data' });
        }
    }

    if (reply[0] == 'LOGIN') {
        if (reply[1] != null && reply[2] != null) {
            User.findOne({ email: reply[1] }, (err, usuario) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' })
                if (usuario) {
                    bcrypt.compare(reply[2], usuario.password, (err, check) => {
                        if (check) {
                            if (params.gettoken = true) {
                                return res.status(200).send({ token: jwt.createToken(usuario) })
                            } else {
                                usuario.password = undefined
                                return res.status(200).send({ user: usuario })
                            }
                        } else {
                            return res.status(404).send({ message: 'El usuario no se ha podido identificar.' })
                        }
                    })
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido logear' })
                }
            });
        }
    }

    var tweet = new Tweet();


    if (reply[0] == 'ADD_TWEET'){
        if (reply[1] != null){
            tweet.bodyTweet = reply.join(' ');
            tweet.bodyTweet = tweet.bodyTweet.replace('ADD_TWEET', '' );
            tweet.bodyTweet = tweet.bodyTweet.replace(' ', '');
            tweet.save((err, saveTweet)=>{
                if ( err ) {
                    res.status(500).send({ message: 'Error in the server' });
                } else if (saveTweet){
                    res.send({ Tweetposted: saveTweet});
                }
            });
        }else{
            res.send({ TweetPosted: 'The tweet is empty, What do you have in mind' });
        }
    }


    if( reply [0] =='SET_TWEET'){
        if(reply [1] != null && reply [2] != null){
            User.findByIdAndUpdate(reply[2], {$push: { tweets: reply[1]}},{new:true}, (err, userNewPost)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(userNewPost){
                    res.status(200).send({NewPost: userNewPost});    
                }else{
                    res.status(418).send({message: 'Error al actualizar'});
                }
            });
        }else{
            res.send({ TweetPosted: 'Id de tweet o usuario no es correcto' });
        }
    }

    if (reply[0] == 'VIEW_TWEETS'){
        if (reply[1] != null){
            User.findOne({username : { $regex : reply[1], $options : 'i'}},(err, userFind)=>{
                if (err){
                    res.status(500).send({message: 'Error in the server0'});
                }else if (userFind){
                    User.find({ username: reply[1] }, {tweets: 1, _id: 0 }, (err, tweets)=>{
                        if (err){
                            res.status(500).send({message: 'Error in the server1'});                            
                        } else{
                            Tweet.populate(tweets, { path: "tweets"}, (err, tweets)=>{
                                if (err){
                                    res.status(500).send({message: 'Error in the server2'});
                                } else if (tweets){
                                    res.send({user: reply[1], tweets});
                                } else {
                                    res.status(404).send({message: 'No se pueden mostrar los tweets de este usuario'});
                                }
                            });
                        }
                    })
                } else{
                    res.send({message: 'No se ha podido encontrar el usuario'});
                }
            });
        }
    }

    if(reply[0] == 'DELETE_TWEET'){
        if(reply[1] != null){
            User.findByIdAndUpdate(idUser.idUser, {$pull:{tweets: reply[1]}},{new: true},(err, tweetFound)=>{
                if(err){
                    res.status(500).send({message: 'Error general '});
                }else if (tweetFound){
                    Tweet.findByIdAndRemove(reply[1], (err, tweetRemoved)=>{	
                        if(err){
                            res.status(500).send({message: 'Error general al eliminar'});
                        }else if(tweetRemoved){
                            res.send({message: 'El siguiente tweet ha sido eliminado: ',tweet: tweetRemoved});
                        }else{
                            res.status(404).send({message: 'No se ha podido eliminar, intente mas tarde'});
                        }
                    });    
                }else{
                    res.status(404).send({error: 'No se encontro el tweet'})
                }
            });
        }else{
            res.send({ Not_found: 'Id de tweet no es correcto' });
        }
    }

    if(reply[0] == 'EDIT_TWEET'){
        if (reply[1] != null && reply[2] != null){
            tweet._id = reply[1];
            tweet.bodyTweet = reply.join(' ');
            tweet.bodyTweet = tweet.bodyTweet.replace('EDIT_TWEET', '' );
            tweet.bodyTweet = tweet.bodyTweet.replace(reply[1], '');
            tweet.bodyTweet = tweet.bodyTweet.replace('  ', '');
            let update = tweet.bodyTweet
            Tweet.findByIdAndUpdate(reply[1], {$set:{bodyTweet: update}}, {new: true}, (err, tweetUpdated)=>{
                if(err){
                    res.status(500).send({message: 'Error general al actualizar', err});
                }else if(tweetUpdated){
                    res.send({tweetUpdated: tweetUpdated});
                }else{
                    res.status(404).send({message: 'No se ha podido actualizar'});
                }
            });
        }else{
            res.send({ message:'No ha llenado un campo' });
        }
    }

    if(reply[0] == 'PROFILE'){
        if(reply[1] != null){
            User.findOne({
             username: { $regex: reply[1], $options: 'i'} }, {tweets: 1, _id: 0, follower: 1, following:1, email:1 },  
             (err, userProfile) => {
                if (err) {
                    res.status(500).send({ message: 'Error in the server' });
                } else if (userProfile) {
                    res.status(200).send({profile: userProfile});
                } else {
                    res.status(200).send({ message: 'Nombre de usuario inexistente' });
                }
            });
        }else{
            res.send({ message:'No ha llenado un campo' });
        }
    }



    if(reply[0] == 'FOLLOW'){
        if(reply[1] != null){
            User.findOne({username: {$regex: reply[1], $options: 'i'}},(err, userFound)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                } else if (userFound){
                    User.findOneAndUpdate({username:reply[1]}, {$push: { followers: idUser.idUser}},{new:true}, (err, userNewPost)=>{
                        if(err){
                            res.status(500).send({message:'Error general'});
                        }else if(userNewPost){
                            res.status(200).send({NewPost: 'Has seguido a '+reply[1] });
                        }else{
                            res.status(418).send({message: 'Error al actualizar'});
                        }
                    }).populate('tweets')   
                }else{
                    res.status(404).send({message: 'No se encontro el Usuario'})
                }          
            });
        }else{
            res.status(404).send({message: 'No se encontro el Usuario'})

        }
    }

    if (reply[0] == "UNFOLLOW") {
        var username = reply[1];
        if (reply.length == 2) {
            User.findOne({username: username}, (err, userFound) => {
                if (err) {
                    res.status(500).send({message: "Error general" + err});
                } else if (userFound) {
                    if (req.user.username != userFound.username) {
                        User.findOne({_id: req.user.sub,followers: userFound._id}, (err, userFind) => {
                            if (err) {
                                res.status(500).send({message: "Error general" + err});
                            } else if (userFind) {
                                User.findByIdAndUpdate(req.user.sub, {$pull: {followers: userFound._id}}, {new: true}, (err, unfollowedAdded) => {
                                    if (err) {
                                        res.status(500).send({message: "Error general" + err});
                                    } else if (unfollowedAdded) {
                                        User.findByIdAndUpdate(userFound._id, {$pull: {following: req.user.sub}}, {new: true}, (err, succeeded) => {
                                            if (err) {
                                                res.status(500).send({message: "Error general" + err});
                                            } else if (succeeded) {
                                                res.send({unfollow: userFound.username});
                                            } else {
                                                res.status(500).send({message: "No se encontraron datos",});
                                            }
                                        });
                                    } else {res.status(500).send({message: "No pudo dejar de seguir"+unfollowedAdded})}
                                });
                            } else {
                                res.status(200).send({message: "Hubo error en la busqueda",});
                            }
                        });
                    } else {
                        res.status(200).send({message: "No se puede dejar de seguir"});
                    }
                } else {res.status(404).send({message: "No se encontro el usuario"});
                }
            });
        } else {res.send({message: "No ha llenado un campo"});
        }
    }
}



module.exports = {
    commands

}