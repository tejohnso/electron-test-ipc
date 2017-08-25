const JSONStream = require("JSONStream");
const debuglog = require("util").debuglog("player");
const colors = require("colors");
const info = (str)=>{debuglog(JSON.stringify(str).green)};
const debug = (str)=>{debuglog(JSON.stringify(str).white)};
const error = (str)=>{debuglog(JSON.stringify(str).red.bold)};
const net = require("net");
colors.enabled = true;

info(`hello - kill me with kill -s sigusr2 ${process.pid}`);
process.on("SIGUSR2", ()=>{debug("SIGUSR2 - EXITING"); process.exit();})

const skt = net.createConnection("/tmp/test.skt", (something)=>{
  debug("connected to main");
});
skt.on("error", error);
skt.on("end", ()=>debug("end"));
skt.pipe(JSONStream.parse()).on("data", info);

process.stdout.resume();
