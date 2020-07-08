'use strict'

const jwt = require('jwt-simple')
const moment = require('moment')

const secret = 'password'

exports.ensureAuth =  function(req, res, next) {
    let params = req.body;
    let arrUserData = Object.values(params);
    let reply = arrUserData.toString().split(" ");

    if(!req.headers.authorization) {
        if(reply[0] == 'REGISTER' || reply[0]=='LOGIN'){
            next();
        }else{
            return res.status(403).send({ message: 'Se necesita que usuario este logueado' +reply[0] });
        }  
    }else{
        var token = req.headers.authorization.replace(/['"]+/g, '')
        try {
            var payload = jwt.decode(token, secret, true)
          
            let idUser = payload.sub;
            console.log(idUser);
            module.exports.idUser = idUser;
            if(payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'El token ha expirado' })
            }
        } catch(ex) {
            return res.status(404).send({ message: 'El token no es valido' })
        }
    
        req.user = payload
        next()
    }
    

    
}