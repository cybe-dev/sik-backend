const moment = require("moment");
const { classification, transaction } = require("../models");
const sequelize = require("sequelize");
const responseMock = require("../helpers/response-mock");

const recap = (req, res) => {
  const {
    month = moment().format("M"),
    year = moment().format("YYYY"),
  } = req.query;

  classification
    .findAll({
      attributes: [
        "id",
        "code",
        "name",
        [
          sequelize.fn("SUM", sequelize.col("transactions.amount")),
          "total_amount",
        ],
      ],
      order: [["code", "ASC"]],
      include: [
        {
          model: transaction,
          as: "transactions",
          attributes: [],
          required: false,
          where: {
            [sequelize.Op.and]: [
              sequelize.where(
                sequelize.fn("MONTH", sequelize.col("transactions.actualDate")),
                month
              ),
              sequelize.where(
                sequelize.fn("YEAR", sequelize.col("transactions.actualDate")),
                year
              ),
            ],
          },
        },
      ],
      group: ["classification.id"],
    })
    .then((result) => {
      responseMock.success(
        res,
        200,
        "Berhasil menampilkan rekapitulasi",
        result
      );
    })
    .catch((e) => {
      console.log(e);
      responseMock.error(res);
    });
};

module.exports = recap;
