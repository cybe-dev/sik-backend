"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class monthly_balance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  monthly_balance.init(
    {
      actualDate: {
        allowNull: false,
        type: DataTypes.DATE,
        validate: {
          notEmpty: true,
          isDate: true,
        },
      },
      balance: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notEmpty: true,
          isNumeric: true,
        },
      },
    },
    {
      sequelize,
      modelName: "monthly_balance",
    }
  );
  return monthly_balance;
};
