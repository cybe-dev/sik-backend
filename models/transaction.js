"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.classification, {
        as: "classification",
        foreignKey: "classificationId",
      });
    }
  }
  transaction.init(
    {
      actualDate: {
        allowNull: false,
        type: DataTypes.DATE,
        validate: {
          notEmpty: true,
          isDate: true,
        },
      },
      note: {
        allowNull: false,
        type: DataTypes.TEXT,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM("in", "out"),
        validate: {
          notEmpty: true,
          isIn: [["in", "out"]],
        },
      },
      amount: {
        allowNull: false,
        type: DataTypes.BIGINT,
        validate: {
          notEmpty: true,
          isInt: true,
        },
      },
      classificationId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
        },
      },
    },
    {
      sequelize,
      modelName: "transaction",
    }
  );
  return transaction;
};
