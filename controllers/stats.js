const moment = require("moment");
const sequelize = require("sequelize");
const responseMock = require("../helpers/response-mock");
const { transaction, monthly_balance } = require("../models");
const { getIncome } = require("./transaction");

const stats = async (req, res) => {
  const month = moment().format("M");
  const year = moment().format("YYYY");
  let recentMonthMax = parseInt(month) - 5;
  let recentYearMax = parseInt(year);

  if (recentMonthMax <= 0) {
    recentMonthMax = recentMonthMax + 12;
    recentYearMax = recentYearMax - 1;
  }

  let getTransaction,
    thisMonthIncome = 0,
    thisMonthOutcome = 0,
    thisMonthBalance = 0,
    thisMonthBalanceRemaining = 0,
    recentData = [];

  try {
    thisMonthBalance = await monthly_balance.findOne({
      where: {
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
    });
    recentData = await transaction.findAll({
      where: {
        actualDate: {
          [sequelize.Op.gte]: `${recentYearMax}-${recentMonthMax}-01`,
        },
      },
      attributes: [
        "actualDate",
        "status",
        [
          sequelize.fn("SUM", sequelize.col("transaction.amount")),
          "total_amount",
        ],
      ],
      order: [["actualDate", "DESC"]],
      group: [
        sequelize.fn("YEAR", sequelize.col("transaction.actualDate")),
        sequelize.fn("MONTH", sequelize.col("transaction.actualDate")),
        "status",
      ],
    });
    getTransaction = await transaction.findAll({
      where: {
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
      attributes: [
        "actualDate",
        "status",
        [
          sequelize.fn("SUM", sequelize.col("transaction.amount")),
          "total_amount",
        ],
      ],
      group: ["status"],
    });
  } catch (e) {
    console.log(e);
    responseMock.error(res);
    return;
  }

  try {
    const getIncome = getTransaction.find((predicate) => {
      return predicate.dataValues.status === "in";
    });
    const getOutcome = getTransaction.find((predicate) => {
      return predicate.dataValues.status === "out";
    });

    if (getIncome) {
      thisMonthIncome = parseInt(getIncome.dataValues.total_amount);
    }
    if (getOutcome) {
      thisMonthOutcome = parseInt(getOutcome.dataValues.total_amount);
    }

    if (thisMonthBalance) {
      thisMonthBalance = thisMonthBalance.balance;
      thisMonthBalanceRemaining =
        thisMonthBalance + thisMonthIncome - thisMonthOutcome;
    }
  } catch (e) {
    responseMock.error(res);
    return;
  }

  responseMock.success(res, 200, "Berhasil menampilkan statistik", {
    thisMonthIncome,
    thisMonthOutcome,
    thisMonthBalance: thisMonthBalance || 0,
    thisMonthBalanceRemaining,
    recentData,
  });
};

module.exports = stats;
