/*Local Storage*/
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
/*  EXPRESS SETUP  */

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendFile('auth.html', { root : __dirname}));

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));

/*  PASSPORT SETUP  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => {
    if(localStorage.getItem('unm')!=null && localStorage.getItem('unm')==req.query.username) {
        res.send("Welcome " + req.query.username + "!!");
        //localStorage.removeItem('unm');
    }
    else {
        res.redirect('/');
        localStorage.removeItem('unm');
    }
});
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
        cb(err, user);
    });
});

/* MONGOOSE SETUP */

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dbpassport');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});
const UserDetails = mongoose.model('users', UserDetail, 'users');

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        UserDetails.findOne({
            username: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (user.password != password) {
                return done(null, false);
            }
            return done(null, user);
        });
    }
));

app.post('/chk',
    passport.authenticate('local', { failureRedirect: '/error' }),
    function(req, res) {
        localStorage.setItem('unm',req.user.username);
        res.redirect('/success?username='+req.user.username);
    });