"use strict";
const pdf = require("pdf-creator-node");
const fs = require("fs");
const { transaction, classification, monthly_balance } = require("../models");
const sequelize = require("sequelize");
const responseMock = require("../helpers/response-mock");
const moment = require("moment");
const jwt = require("jsonwebtoken");

moment.locale("id");

const rupiahFormat = (number) => {
  return "Rp" + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const monthName = {
  1: "JANUARI",
  2: "FEBRUARI",
  3: "MARET",
  4: "APRIL",
  5: "MEI",
  6: "JUNI",
  7: "JULI",
  8: "AGUSTUS",
  9: "SEPTEMBER",
  10: "OKTOBER",
  11: "NOVEMBER",
  12: "DESEMBER",
};

const exportLedger = async (req, res) => {
  const {
    month = moment().format("M"),
    year = moment().format("YYYY"),
  } = req.params;

  let balance;
  let getBalance;
  try {
    getBalance = await monthly_balance.findOne({
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
    balance = parseInt(getBalance.balance);
  } catch (e) {
    console.log(e);
    responseMock.error(res);
    return;
  }

  transaction
    .findAll({
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
      include: [
        {
          model: classification,
          as: "classification",
          attributes: ["id", "code"],
        },
      ],
      order: [
        ["actualDate", "ASC"],
        ["id", "ASC"],
      ],
    })
    .then((result) => {
      const filename = `ledger-${year}-${month}`;
      const html = fs.readFileSync(
        "./document-templates/pdf/ledger.html",
        "utf8"
      );
      const dataRow = [
        {
          date: moment(getBalance.actualDate).format("DD-MMM-YYYY"),
          note: `SALDO PER ${monthName[month]} ${year}`,
          code: "KAS",
          color: "#D9D9D9",
          debet: rupiahFormat(balance),
          credit: "-",
          balance: rupiahFormat(balance),
        },
      ];
      let totalDebet = balance;
      let totalCredit = 0;
      for (const item of result) {
        const temp = {
          date: moment(item.actualDate).format("DD-MMM-YYYY"),
          note: item.note,
          color: "#D9D9D9",
          code: "KAS",
        };
        if (item.classification) {
          temp.code = item.classification.code;
          temp.color = "#FFF";
        }
        if (item.status === "in") {
          balance = balance + parseInt(item.amount);
          totalDebet = totalDebet + parseInt(item.amount);
          temp.debet = rupiahFormat(item.amount);
          temp.credit = "-";
          temp.balance = rupiahFormat(balance);
        } else {
          balance = balance - parseInt(item.amount);
          totalCredit = totalCredit + parseInt(item.amount);
          temp.credit = rupiahFormat(item.amount);
          temp.debet = "-";
          temp.balance = rupiahFormat(balance);
        }
        dataRow.push(temp);
      }

      const options = {
        format: "Letter",
        orientation: "landscape",
        border: "10mm",
        footer: {
          height: "28mm",
          contents: {
            default:
              '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          },
        },
      };

      const document = {
        html: html,
        data: {
          results: dataRow,
          company: process.env.COMPANY_NAME,
          balance: rupiahFormat(balance),
          periode: monthName[month] + " " + year,
          totalCredit: rupiahFormat(totalCredit),
          totalDebet: rupiahFormat(totalDebet),
        },
        path: `./document-generated/pdf/${filename}.pdf`,
        type: "",
      };

      pdf
        .create(document, options)
        .then((resultCreated) => {
          responseMock.success(
            res,
            201,
            "PDF Report has been generated",
            `/export/stream/${filename}.pdf?token=${createTemporaryToken(req)}`
          );
        })
        .catch((error) => {
          console.log(e);
          responseMock.error(res);
        });
    })
    .catch((e) => {
      console.log(e);
      responseMock.error(res);
    });
};

const exportRecap = (req, res) => {
  const {
    month = moment().format("M"),
    year = moment().format("YYYY"),
  } = req.params;

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
      const filename = `recap-${year}-${month}`;
      const html = fs.readFileSync(
        "./document-templates/pdf/recap.html",
        "utf8"
      );
      const rowData = [];
      let total = 0;

      for (const item of result) {
        total = total + parseInt(item.dataValues.total_amount || 0);
        rowData.push({
          code: item.code,
          name: item.name,
          total_amount: rupiahFormat(item.dataValues.total_amount || 0),
        });
      }

      const options = {
        format: "Letter",
        orientation: "portrait",
        border: "10mm",
        footer: {
          height: "28mm",
          contents: {
            default:
              '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          },
        },
      };

      const document = {
        html: html,
        data: {
          results: rowData,
          company: process.env.COMPANY_NAME,
          total: rupiahFormat(total),
          periode: monthName[month] + " " + year,
        },
        path: `./document-generated/pdf/${filename}.pdf`,
        type: "",
      };

      pdf
        .create(document, options)
        .then((resultCreated) => {
          responseMock.success(
            res,
            201,
            "PDF Report has been generated",
            `/export/stream/${filename}.pdf?token=${createTemporaryToken(req)}`
          );
        })
        .catch((error) => {
          responseMock.error(res);
        });
    })
    .catch((e) => {
      console.log(e);
      responseMock.error(res);
    });
};

const createTemporaryToken = (req) => {
  const { id } = req.user;
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
};

const exportOutcome = (req, res) => {
  const {
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
    classificationId = 0,
  } = req.params;

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

  if (classificationId > 0) {
    where["$classification.id$"] = classificationId;
  }

  transaction
    .findAll({
      where,
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
      const rowData = [];
      let total = 0;
      let code = "";
      let filename = `outcome-${year}-${month}`;
      if (classificationId > 0 && result.length > 0) {
        code =
          "Kode " +
          result[0].dataValues.classification.dataValues.code +
          " : " +
          result[0].dataValues.classification.dataValues.name;
        filename += "-" + result[0].dataValues.classification.dataValues.code;
      }
      for (const item of result) {
        total = total + parseInt(item.amount);
        rowData.push({
          actualDate: moment(item.actualDate).format("DD-MMM-YYYY"),
          note: item.note,
          amount: rupiahFormat(item.amount),
        });
      }
      const html = fs.readFileSync(
        "./document-templates/pdf/outcome.html",
        "utf8"
      );

      const options = {
        format: "Letter",
        orientation: "portrait",
        border: "10mm",
        footer: {
          height: "28mm",
          contents: {
            default:
              '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          },
        },
      };

      const document = {
        html: html,
        data: {
          results: rowData,
          company: process.env.COMPANY_NAME,
          total: rupiahFormat(total),
          periode: monthName[month] + " " + year,
          code,
        },
        path: `./document-generated/pdf/${filename}.pdf`,
        type: "",
      };

      pdf
        .create(document, options)
        .then((resultCreated) => {
          responseMock.success(
            res,
            201,
            "PDF Report has been generated",
            `/export/stream/${filename}.pdf?token=${createTemporaryToken(req)}`
          );
        })
        .catch((error) => {
          responseMock.error(res);
        });
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const exportIncome = (req, res) => {
  const {
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
  } = req.params;

  const where = {
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
  };

  transaction
    .findAll({
      where,
      order: [["actualDate", "ASC"]],
    })
    .then((result) => {
      const rowData = [];
      let total = 0;
      let filename = `income-${year}-${month}`;

      for (const item of result) {
        total = total + parseInt(item.amount);
        rowData.push({
          actualDate: moment(item.actualDate).format("DD-MMM-YYYY"),
          note: item.note,
          amount: rupiahFormat(item.amount),
        });
      }
      const html = fs.readFileSync(
        "./document-templates/pdf/income.html",
        "utf8"
      );

      const options = {
        format: "Letter",
        orientation: "portrait",
        border: "10mm",
        footer: {
          height: "28mm",
          contents: {
            default:
              '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
          },
        },
      };

      const document = {
        html: html,
        data: {
          company: process.env.COMPANY_NAME,
          results: rowData,
          total: rupiahFormat(total),
          periode: monthName[month] + " " + year,
        },
        path: `./document-generated/pdf/${filename}.pdf`,
        type: "",
      };

      pdf
        .create(document, options)
        .then((resultCreated) => {
          responseMock.success(
            res,
            201,
            "PDF Report has been generated",
            `/export/stream/${filename}.pdf?token=${createTemporaryToken(req)}`
          );
        })
        .catch((error) => {
          responseMock.error(res);
          console.log(error);
        });
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const stream = (req, res) => {
  const file = fs.createReadStream(
    `./document-generated/pdf/${req.params.filename}`
  );
  const stat = fs.statSync(`./document-generated/pdf/${req.params.filename}`);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=${req.params.filename}`
  );
  file.pipe(res);
};

module.exports = {
  exportOutcome,
  exportIncome,
  stream,
  exportRecap,
  exportLedger,
};
