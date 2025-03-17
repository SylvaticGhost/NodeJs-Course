const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    const user = req.user.username;

    if(user) {
        res.render('home', {title: 'Express'});
    }
    else {
        res.render('index', {title: 'Express'});
    }
});

module.exports = router;
