'use strict';

const { ValidationError } = require('sequelize');
const bcrypt = require('bcryptjs');

const DEFAULT_OPTIONS = {
	rounds: 10,
	compare: 'authenticate',
	field: 'password',
};

//method one

const useBcrypt = (Model, options = DEFAULT_OPTIONS) => {
	const { rounds, compare, field } = { ...DEFAULT_OPTIONS, ...options };

	const hasField = (instance) => {
		try {
			const changedKey = Array.from(instance._changed).find(
				(key) => key === field
			);
			if (!changedKey) {
				return;
			}

			const fieldDefinition = instance.rawAttributes[changedKey];
			if (!fieldDefinition) {
				return;
			}

			if (!instance[changedKey]) {
				return;
			}
			const salt = bcrypt.genSaltSync(rounds);
			const hash = bcrypt.hashSync(instance[changedKey], salt);
			instance[changedKey] = hash;
		} catch (err) {
			throw new ValidationError(err.message);
		}
	};

	Model.prototype[compare] = (password) => {
		return bcrypt.compareSync(password, this._previousDataValues[field]);
	};

	Model.addHook('beforeCreate', hasField);
	Model.addHook('beforeUpdate', hasField);
};

// method two

// const userBcrypt = (Model, options = DEFAULT_OPTIONS) => {
// 	const { field, compare, rounds } = options;

// 	Model.addHook('beforeCreate', (user) => {
// 		if (user[field]) {
// 			user[field] = bcrypt.hashSync(user[field], rounds);
// 		}
// 	});

// 	Model.addHook('beforeUpdate', (user) => {
// 		if (user[field]) {
// 			user[field] = bcrypt.hashSync(user[field], rounds);
// 		}
// 	});

// 	Model.prototype[compare] = function (password) {
// 		return bcrypt.compareSync(password, this[field]);
// 	};
// };

module.exports = {
	useBcrypt,
};
