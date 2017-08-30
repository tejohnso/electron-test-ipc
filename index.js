const {info, debug, error} = require("./cli-logger.js")("main");
const {join: pathJoin} = require("path");
const path = pathJoin(__dirname, "..", "modules");
const socketFilePath = require("os").platform() === "win32" ?
pathJoin('\\\\?\\pipe', process.cwd(), 'rise-local-messaging-pipe') :
pathJoin(process.cwd(), "rise-local-messaging-socket");

if (process.env.LOAD_MODULE_NAME) {
  debug(`loading  ${process.env.LOAD_MODULE_NAME}`);
  try {
    require(pathJoin(path, process.env.LOAD_MODULE_NAME));
  }catch(e) {
    debug(`could not load module ${pathJoin(path, process.env.LOAD_MODULE_NAME)}`);
    debug(e);
    process.exit();
  }
  return;
}

const fs = require("fs");
const dirContents = fs.readdirSync(path);
const {spawn} = require("child_process");
const net = require("net");
let clients = new Set();

info(`hello - tell me to broadcast a message with kill -s sigusr2 ${process.pid}`);

try {
  require("fs").unlinkSync(socketFilePath);
}catch(e){}

const svr = net.createServer().listen(socketFilePath);
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
dirContents.forEach(startModule);

function startModule(name) {
  const asElectron = Object.assign({}, process.env, {
    LOAD_MODULE_NAME: name
  });
  const asNode = Object.assign({}, process.env, {
    ELECTRON_RUN_AS_NODE: true
  });

  const moduleAsElectron = require(pathJoin(path, `${name}`, "package.json")).asElectron;
  const env = moduleAsElectron ? asElectron : asNode;
  const args = moduleAsElectron ? [] : [pathJoin(path, name)];

  let child = spawn(process.execPath, args, {stdio: "inherit", env});
  debug(`started ${process.execPath} ${args} as ${moduleAsElectron ? "electron" : "node"}`);
  child.on("error", error);
  child.on("exit", debug.bind(null, `${name} exited`));
}
