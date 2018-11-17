module.exports = name => {
  let isVC = require("./isValidChar");

  for (let i = 0; i < name.length; ++i) {
    if (!isVC(name[i].charCodeAt(0))) return false;
  }
  return true;
};
