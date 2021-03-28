"use strict";
const { classification } = require("../models");
const responseMock = require("../helpers/response-mock");

const destroy = (req, res) => {
  const { id } = req.params;

  classification
    .findByPk(id)
    .then((result) => {
      if (result) {
        classification
          .destroy({
            where: {
              id,
            },
          })
          .then((resultDeleted) => {
            responseMock.success(res, 200, "Klasifikasi telah dihapus", result);
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(res, 404, "Klasifikasi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const edit = (req, res) => {
  const { id } = req.params;
  const { code, name } = req.body;

  classification
    .findByPk(id)
    .then((result) => {
      if (result) {
        const dataSet = {
          code,
          name,
        };

        classification
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
              "Klasifikasi telah diperbaharui",
              dataSet
            );
          })
          .catch((e) => {
            responseMock.error(res);
          });
      } else {
        responseMock.error(res, 404, "Klasifikasi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const getAll = (req, res) => {
  classification
    .findAll({
      order: [["code", "ASC"]],
    })
    .then((result) => {
      if (result.length) {
        responseMock.success(
          res,
          200,
          "Berhasil menampikan klasifikasi",
          result
        );
      } else {
        responseMock.error(res, 404, "Klasifikasi tidak ditemukan");
      }
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

const create = (req, res) => {
  const { code, name } = req.body;

  classification
    .create({
      code,
      name,
    })
    .then((result) => {
      responseMock.success(
        res,
        201,
        "Klasifikasi berhasil ditambahkan",
        result
      );
    })
    .catch((e) => {
      responseMock.error(res);
    });
};

module.exports = {
  create,
  getAll,
  edit,
  destroy,
};
