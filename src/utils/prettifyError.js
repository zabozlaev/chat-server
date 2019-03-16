module.exports = {
  validationErrors(error) {
    return error.errors.length > 0
      ? error.errors.map(error => ({
          message: error.message,
          path: error.path
        }))
      : [
          {
            path: "Internal Server Error.",
            message: "Something went wrong..."
          }
        ];
  }
};
