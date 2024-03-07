const User = require('../models/users')
const bcrypt = require('bcrypt')
const passport = require('passport');
class UserController {
    index(req, res) {
        res.render('register')
    }
    regist(req, res, next) {
        const { username, password } = req.body;
        let errors = [];
        if (!username || !password) {
            errors.push({ msg: 'Please enter all fields' });
        }
        if (password.length < 6) {
            errors.push({ msg: 'Password must be at least 6 characters' });
        }
        if (errors.length > 0) {
            res.render('register', {
                errors,
                username,
                password
            });
        }
        else {
            User.findOne({ username: username }).then(user => {
                if (user) {
                    errors.push({ msg: 'Username already exists' });
                    res.render('register', {
                        errors,
                        username,
                        password
                    });
                }
                else {
                    const newUser = new User({
                        username,
                        password
                    });
                    //Hash password
                    bcrypt.hash(newUser.password, 10, function (err, hash) {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.redirect('/users/login');
                            })
                            .catch(next);
                    });
                }
            });
        }

    }
    login(req, res) {
        // console.log("test login");
        res.render('login');
    }
    signin(req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/users/dashboard',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);

    }
    signout(req, res, next) {
        req.logout(function (err) {
            if (err) { return next(err); }
            req.flash('success_msg', 'You are logged out');
            res.redirect('/users/login');
        });
    }

    dashboard(req, res) {
        res.render('dashboard')
    }
}
module.exports = new UserController