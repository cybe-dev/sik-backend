"use strict";
const { transaction, classification } = require("../models");
const sequelize = require("sequelize");
const responseMock = require("../helpers/response-mock");

const setIncome = (req, res) => {
  const { id } = req.params;

  transaction
    .findByPk(id)
    .then((result) => {
      if (result) {
        const { actualDate, note, amount } = req.body;
        const dataSet = {
          actualDate,
          note,
          amount,
        };

        transaction
          .update(dataSet, {
            where: {
              id,
            },
          })
          .then((resultUpdated) => {
            dataSet.id = result.id;
            dataSet.status = result.status;

            responseMock.success(
              res,
              200,
              "Transaksi telah diperbaharui",
              dataSet
            );
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(res, 404, "Transaksi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const getIncome = (req, res) => {
  const {
    offset = 0,
    limit = 2,
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
  } = req.query;

  transaction
    .findAndCountAll({
      where: {
        status: "in",
        [sequelize.Op.and]: [
          sequelize.where(
            sequelize.fn("MONTH", sequelize.col("transaction.actualDate")),
            month
          ),
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("transaction.actualDate")),
            year
          ),
        ],
      },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["actualDate", "ASC"]],
    })
    .then((result) => {
      if (result.count > 0) {
        responseMock.success(
          res,
          200,
          "Berhasil menampilkan data transaksi",
          result
        );
      } else {
        responseMock.error(res, 404, "Transaksi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const addIncome = (req, res) => {
  const { actualDate, note, amount } = req.body;

  const dataSet = {
    actualDate,
    note,
    status: "in",
    amount,
  };

  transaction
    .create(dataSet)
    .then((result) => {
      responseMock.success(res, 201, "Pemasukkan telah ditambahkan", result);
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const destroy = (req, res) => {
  const { id } = req.params;

  transaction
    .findByPk(id)
    .then((result) => {
      if (result) {
        transaction
          .destroy({
            where: {
              id,
            },
          })
          .then((resultDeleted) => {
            responseMock.success(res, 200, "Transaksi telah dihapus", result);
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(res, 404, "Transaksi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const getOutcome = (req, res) => {
  const {
    offset = 0,
    limit = 2,
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
    classificationId,
  } = req.query;

  const where = {
    status: "out",
    [sequelize.Op.and]: [
      sequelize.where(
        sequelize.fn("MONTH", sequelize.col("transaction.actualDate")),
        month
      ),
      sequelize.where(
        sequelize.fn("YEAR", sequelize.col("transaction.actualDate")),
        year
      ),
    ],
  };

  if (classificationId) {
    where["$classification.id$"] = classificationId;
  }

  transaction
    .findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["actualDate", "ASC"]],
      include: [
        {
          model: classification,
          as: "classification",
          attributes: ["id", "code", "name"],
        },
      ],
    })
    .then((result) => {
      if (result.count > 0) {
        responseMock.success(
          res,
          200,
          "Berhasil menampilkan data transaksi",
          result
        );
      } else {
        responseMock.error(res, 404, "Transaksi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const addOutcome = (req, res) => {
  const { actualDate, note, amount, classificationId } = req.body;

  const dataSet = {
    actualDate,
    note,
    status: "out",
    amount,
    classificationId,
  };

  transaction
    .create(dataSet)
    .then((result) => {
      responseMock.success(res, 201, "Pengeluaran telah ditambahkan", result);
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const setOutcome = (req, res) => {
  const { id } = req.params;

  transaction
    .findByPk(id)
    .then((result) => {
      if (result) {
        const { actualDate, note, amount, classificationId } = req.body;
        const dataSet = {
          actualDate,
          note,
          amount,
          classificationId,
        };

        transaction
          .update(dataSet, {
            where: {
              id,
            },
          })
          .then((resultUpdated) => {
            dataSet.id = result.id;
            dataSet.status = result.status;

            responseMock.success(
              res,
              200,
              "Transaksi telah diperbaharui",
              dataSet
            );
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(res, 404, "Transaksi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports = {
  addIncome,
  getIncome,
  setIncome,
  destroy,
  getOutcome,
  addOutcome,
  setOutcome,
};
