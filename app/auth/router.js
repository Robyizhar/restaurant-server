// import package yang diperlukan 
const router = require('express').Router();
const multer = require('multer');
// import auth/controller.js
const controller = require('./controller');

// Package Login
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Default Username field
// passport.use(new LocalStrategy(controller.localStrategy));
passport.use(new LocalStrategy({usernameField: 'email'}, controller.localStrategy));

// buat endpoint
router.post('/register', multer().none(), controller.register);
router.post('/login', multer().none(), controller.login);
router.get('/me', controller.me);
router.post('/logout', controller.logout);

// export router
module.exports = router;