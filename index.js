const debuglog = require("util").debuglog("main");
const colors = require("colors");
const info = (str)=>{debuglog(JSON.stringify(str).green)};
const debug = (str)=>{debuglog(JSON.stringify(str).white)};
const error = (str)=>{debuglog(JSON.stringify(str).red.bold)};
const {join: pathJoin} = require("path");
const path = pathJoin(__dirname, "..", "modules");

if (process.argv[1] && process.argv[1].includes("--module")) {
  const moduleName = process.argv[1].split("=")[1];
  require(pathJoin(path, `${moduleName}.asar`, moduleName));
  return;
}

const fs = require("fs");
const dirContents = fs.readdirSync(path);
const {fork, spawn} = require("child_process");
const {homedir} = require("os");
const asElectron = { stdio: "inherit", env: process.env};
const net = require("net");
let clients = new Set();

info(`hello - tell me to broadcast a message with kill -s sigusr2 ${process.pid}`);

try {
  require("fs").unlinkSync("/tmp/test.skt");
}catch(e){}

const fdPath = pathJoin(homedir());
const svr = net.createServer().listen("/tmp/test.skt");
svr.on("error", error);
svr.on("connection", (client)=>{
  clients.add(client);
  debug(`connection count: ${clients.size}`);
  client.on("close", ()=>{
    clients.delete(client);
    debug("closed a client connection");
    debug(`connection count: ${clients.size}`);
  });
});
process.on("SIGUSR2", ()=>{
  clients.forEach(client=>client.write('{"msg": "broadcast from main"}'));
});

debug(dirContents);
debug(path);
dirContents.forEach(forkModule);

function forkModule(name) {
  debug(process.execPath);
  let child = spawn(process.execPath, [`--module=${name.split(".")[0]}`], asElectron);
  debug(`forked ${name}`);
  child.on("error", error);
  child.on("exit", debug.bind(null, `${name} exited`));
}
