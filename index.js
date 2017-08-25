const debuglog = require("util").debuglog("main");
const colors = require("colors");
const info = (str)=>{debuglog(JSON.stringify(str).green)};
const debug = (str)=>{debuglog(JSON.stringify(str).white)};
const error = (str)=>{debuglog(JSON.stringify(str).red.bold)};
const net = require("net");
const {homedir} = require("os");
const {app} = require("electron");
const fs = require("fs");
const fork = require("child_process").fork;
const {join: pathJoin} = require("path");
const path = pathJoin(__dirname, "..", "modules");
const dirContents = fs.readdirSync(path);
const asElectron = { env: {NODE_DEBUG: process.env.NODE_DEBUG, ELECTRON_RUN_AS_NODE: false}};
const noElectron = { env: {NODE_DEBUG: process.env.NODE_DEBUG, ELECTRON_RUN_AS_NODE: true}};
let clients = [];

info(`hello - tell me to broadcast a message with kill -s sigusr2 ${process.pid}`);

try {
  require("fs").unlinkSync("/tmp/test.skt");
}catch(e){}

const fdPath = pathJoin(homedir());
const svr = net.createServer().listen("/tmp/test.skt");
svr.on("error", error);
svr.on("connection", clients.push.bind(clients));
process.on("SIGUSR2", ()=>{
  clients.forEach(client=>client.write('{"msg": "broadcast from main"}'));
});

debug(dirContents);
debug(path);
dirContents.forEach(forkModule);

function forkModule(name) {
  let child = fork(pathJoin(path, name, name.split(".")[0]), [], noElectron);
  debug(`forked ${name}`);
  child.on("error", error);
  child.on("exit", ()=>{debug(`${name} exited`);});
}
