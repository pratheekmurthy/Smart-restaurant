const errorParser = error => {
  let errorMessageArray = [];
  Object.keys(error.errors).forEach(err => {
    errorMessageArray.push(error.errors[err].message);
  });
  return errorMessageArray;
};

module.exports = errorParser;
