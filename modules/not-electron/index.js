const {info, error, debug} = require("./cli-logger")("not-electron");
const {join: pathJoin} = require("path");
const net = require("net");
const JSONStream = require("JSONStream");
const socketFilePath = require("os").platform() === "win32" ?
pathJoin('\\\\?\\pipe', process.cwd(), 'rise-local-messaging-pipe') :
pathJoin(process.cwd(), "rise-local-messaging-socket");

info(`hello - kill me with kill -s sigusr2 ${process.pid}`);
process.on("SIGUSR2", ()=>{debug("SIGUSR2 - EXITING"); process.exit();})

const skt = net.createConnection(socketFilePath, ()=>{
  debug("connected to main");
});
skt.on("error", error);

skt.pipe(JSONStream.parse()).on("data", info);
