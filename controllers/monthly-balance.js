"use strict";
const responseMock = require("../helpers/response-mock");
const { monthly_balance } = require("../models");
const sequelize = require("sequelize");
const moment = require("moment");

const getMonthlyBalance = (req, res) => {
  const { offset = 0, limit = 20 } = req.query;

  monthly_balance
    .findAndCountAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["actualDate", "DESC"]],
    })
    .then((result) => {
      if (result.count > 0) {
        responseMock.success(res, 200, "Berhasil menampilkan saldo", result);
      } else {
        responseMock.error(res, 404, "Saldo tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const edit = (req, res) => {
  const { id } = req.params;
  const { actualDate, balance } = req.body;
  const month = moment(actualDate).format("M");
  const year = moment(actualDate).format("YYYY");

  monthly_balance
    .findOne({
      where: {
        balance: {
          [sequelize.Op.not]: null,
        },
        [sequelize.Op.and]: [
          sequelize.where(
            sequelize.fn("MONTH", sequelize.col("monthly_balance.actualDate")),
            month
          ),
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("monthly_balance.actualDate")),
            year
          ),
        ],
      },
    })
    .then((result) => {
      if (
        !result ||
        moment(result.actualDate).format("M-YYYY") ===
          moment(actualDate).format("M-YYYY")
      ) {
        monthly_balance
          .findByPk(id)
          .then((result) => {
            if (result) {
              const dataSet = {
                actualDate,
                balance,
              };

              monthly_balance
                .update(dataSet, {
                  where: {
                    id,
                  },
                })
                .then((resultUpdated) => {
                  dataSet.id = id;
                  responseMock.success(
                    res,
                    200,
                    "Saldo telah diperbaharui",
                    dataSet
                  );
                })
                .catch((e) => {
                  responseMock.error(res);
                });
            } else {
              responseMock.error(res, 404, "Saldo tidak ditemukan");
            }
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(
          res,
          400,
          "Saldo bulan ini sudah ditambahkan sebelumnya"
        );
      }
    })
    .catch((e) => {
      console.log(e);
      responseMock.error(res);
    });
};

const create = (req, res) => {
  const { actualDate, balance } = req.body;
  const month = moment(actualDate).format("M");
  const year = moment(actualDate).format("YYYY");

  monthly_balance
    .findOne({
      where: {
        balance: {
          [sequelize.Op.not]: null,
        },
        [sequelize.Op.and]: [
          sequelize.where(
            sequelize.fn("MONTH", sequelize.col("monthly_balance.actualDate")),
            month
          ),
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("monthly_balance.actualDate")),
            year
          ),
        ],
      },
    })
    .then((result) => {
      if (!result) {
        monthly_balance
          .create({
            actualDate,
            balance,
          })
          .then((result) => {
            responseMock.success(
              res,
              201,
              "Saldo berhasil ditambahkan",
              result
            );
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(
          res,
          400,
          "Saldo bulan ini sudah ditambahkan sebelumnya"
        );
      }
    })
    .catch((e) => {
      console.log(e);
      responseMock.error(res);
    });
};

const destroy = (req, res) => {
  const { id } = req.params;

  monthly_balance
    .findByPk(id)
    .then((result) => {
      if (result) {
        monthly_balance
          .destroy({
            where: {
              id,
            },
          })
          .then((resultDeleted) => {
            responseMock.success(res, 200, "Saldo telah dihapus", result);
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(res, 404, "Saldo tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports = { getMonthlyBalance, create, edit, destroy };
