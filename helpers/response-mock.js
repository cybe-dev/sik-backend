module.exports = {
  error: (res, code = 500, type = "Kesalahan internal", data = null) => {
    return res.status(code).json({
      errors: {
        type,
        data,
      },
    });
  },
  success: (res, code = 200, message = "Berhasil", data = null) => {
    return res.status(code).json({
      message,
      data,
    });
  },
};
