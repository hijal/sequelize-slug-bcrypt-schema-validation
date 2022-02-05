var express = require('express');
var router = express.Router();

const User = require('../models').user;

router.get('/', function (req, res, next) {
	User.findAll()
		.then((resp) => {
			res.json({ user: resp });
		})
		.catch((err) => {
			res.json({
				status: 'error',
				message: err.message,
			});
		});
});

router.post('/', function (req, res, next) {
	User.create(req.body)
		.then((resp) => {
			res.json({ user: resp });
		})
		.catch((err) => {
			res.json({
				status: 'error',
				message: err.message,
			});
		});
});

router.post('/login', function (req, res, next) {
	User.findOne({
		where: {
			username: req.body.username,
		},
	})
		.then((user) => {
			if (user.authenticate(req.body.password)) {
				return res.json({
					user: user,
				});
			}
			return res.json({
				status: 'error',
				message: 'Invalid username or password',
			});
		})
		.catch((err) => {
			res.json({
				status: 'error',
				message: err.message,
			});
		});
});

module.exports = router;
