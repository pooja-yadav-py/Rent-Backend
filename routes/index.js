const express = require('express');
const routes = express.Router();

const { registerUser, loginUser, getUsers } = require('../userController/index');
const { userRegisterValidate,userLoginValidate } = require('../utils/userValidation');
const {ensureAuthenticated} = require('../utils/auth');

routes.post('/register', userRegisterValidate,registerUser)

routes.post('/login',userLoginValidate,loginUser)

routes.get('/users', ensureAuthenticated,getUsers);

module.exports = routes;