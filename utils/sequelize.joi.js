'use strict';

const { ValidationError, ValidationErrorItem } = require('sequelize');

const sequelizeJoi = (sequelize) => {
  if (!sequelize)
    throw new Error('The required sequelize instance option is missing.');

  sequelize.addHook('beforeValidate', (instance) => {
    const changedKeys = Array.from(instance._changed);

    if (!changedKeys.length) {
      return;
    }

    // const modelName = instance.constructor.name;

    const validationErrors = [];

    changedKeys.forEach((field) => {
      const fieldDefinition = instance.rawAttributes[field];

      if (!fieldDefinition || !fieldDefinition['schema']) return;
      const schema = fieldDefinition['schema'];

      const value = instance[field];

      const validation = schema.validate(value, {
        abortEarly: false,
        allowUnknown: false,
        doDefaults: false
      });
      validation.error?.details.forEach((validationError) => {
        let errorMsgSegments = validationError.message.split('"');
        let errorPath = `${field}${validationError.path.join('.')}`;
        let errorMsg = `${errorPath}${errorMsgSegments[2]}`;
        let errorType = 'Invalid Schema';
        let errorValue = validationError.context.value;
        let error = new ValidationErrorItem(
          errorMsg,
          errorType,
          errorPath,
          errorValue,
          instance
        );
        validationErrors.push(error);
      });

      instance[field] = validation.value;
    });
    if (validationErrors.length) {
      throw new ValidationError(validationErrors);
    }
  });
};

module.exports = {
  sequelizeJoi
};
