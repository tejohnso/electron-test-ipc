const {info, error, debug} = require("./cli-logger")("player");
const net = require("net");
const JSONStream = require("JSONStream");

const {app} = require("electron");
debug(`${app.getAppPath()} ${app.getVersion()}`);
info(`hello - kill me with kill -s sigusr2 ${process.pid}`);
process.on("SIGUSR2", ()=>{debug("SIGUSR2 - EXITING"); process.exit();})

const skt = net.createConnection("/tmp/test.skt", (something)=>{
  debug("connected to main");
});
skt.on("error", error);
skt.on("end", ()=>debug("end"));
skt.pipe(JSONStream.parse()).on("data", info);
