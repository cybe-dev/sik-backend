"use strict";
const { user } = require("../models");
const responseMock = require("../helpers/response-mock");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const changePassword = (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;

  user
    .findOne({
      where: {
        id,
      },
    })
    .then((result) => {
      if (result) {
        const match = bcrypt.compareSync(oldPassword, result.password);
        if (match) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(newPassword, salt);

          user
            .update(
              {
                password: hash,
              },
              {
                where: {
                  id,
                },
              }
            )
            .then((resultUpdated) => {
              responseMock.success(res, 200, "Password telah diganti");
            })
            .catch((e) => {
              responseMock.error(res);
            });
        } else {
          responseMock.error(res, 401, "Otentikasi gagal");
        }
      } else {
        responseMock.error(res, 401, "Otentikasi gagal");
      }
    })
    .catch((error) => {
      responseMock.error(res);
    });
};

const getToken = (req, res) => {
  const { username, password } = req.query;

  user
    .findOne({
      where: {
        username,
      },
    })
    .then((result) => {
      if (result) {
        const match = bcrypt.compareSync(password, result.password);
        if (match) {
          const responseData = result.dataValues;
          responseData.password = null;

          const token = jwt.sign(
            {
              id: result.id,
              username: result.username,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1d",
            }
          );

          responseData.token = token;

          responseMock.success(res, 200, "Otentikasi berhasil", responseData);
        } else {
          responseMock.error(res, 401, "Otentikasi gagal");
        }
      } else {
        responseMock.error(res, 401, "Otentikasi gagal");
      }
    })
    .catch((error) => {
      responseMock.error(res);
    });
};

module.exports = {
  getToken,
  changePassword,
};
