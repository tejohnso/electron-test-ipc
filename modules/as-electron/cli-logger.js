module.exports = function setLogging(name) {
  const debuglog = require("util").debuglog(name);
  const colors = require("colors");
  colors.enabled = true;

  const info = (str)=>{debuglog(JSON.stringify(str).green)};
  const debug = (str)=>{debuglog(JSON.stringify(str).white)};
  const error = (str)=>{debuglog(JSON.stringify(str).red.bold)};
  return {info, debug, error};
};
