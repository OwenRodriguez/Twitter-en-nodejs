'use strict'

const express = require('express');
const api = express.Router();
const userController = require('../controllers/user.controller');
const md_auth = require ('../middlewares/authenticated');

api.post('/commands',md_auth.ensureAuth, userController.commands);

module.exports = api;
