"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class classification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.transaction, {
        as: "transactions",
        foreignKey: "classificationId",
      });
    }
  }
  classification.init(
    {
      code: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
        unique: true,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "classification",
    }
  );
  return classification;
};
