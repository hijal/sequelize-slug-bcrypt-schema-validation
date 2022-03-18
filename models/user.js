const SequelizeSlugify = require("sequelize-slugify");
const Joi = require("joi");
const { useBcrypt } = require("../utils/bcrypt.password");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      schema: Joi.string().min(4).required(),
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      schema: Joi.string().min(8).required(),
    },
    slug: {
      type: DataTypes.VIRTUAL,
      unique: true,
      get() {
        return `${this.get("username")} ${this.get("id")}`.replace(/\s/g, "-");
      },
    },
  });

  SequelizeSlugify.slugifyModel(User, {
    source: ["username"],
  });

  useBcrypt(User, {
    rounds: 10,
    compare: "authenticate",
  });

  return User;
};
