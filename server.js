const PROTO_PATH = "./tasks.proto";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const tasksProto = grpc.loadPackageDefinition(packageDefinition);
const { v4: uuidv4 } = require("uuid");
const server = new grpc.Server();
const tasks = [];
server.addService(tasksProto.TaskService.service, {
  getAll: (_, callback) => {
    callback(null, { tasks });
  },
  get: (call, callback) => {
    const task = tasks.find((n) => n.id == call.request.id);
    if (task) {
      callback(null, task);
      return;
    }
    callback({
      code: grpc.status.NOT_FOUND,
      details: "Не найдено",
    });
  },
  insert: (call, callback) => {
    const task = call.request;
    task.id = uuidv4();
    tasks.push(task);
    callback(null, task);
  },
  update: (call, callback) => {
    const existingTask = tasks.find((n) => n.id == call.request.id);
    if (existingTask) {
      existingTask.task = call.request.task;
      existingTask.theme = call.request.theme;
      existingTask.duration = call.request.duration;
      callback(null, existingTask);
      return;
    }
    callback({
      code: grpc.status.NOT_FOUND,
      details: "Не найдено",
    });
  },
  remove: (call, callback) => {
    const existingTaskIndex = tasks.findIndex((n) => n.id == call.request.id);
    if (existingTaskIndex == -1) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Не найдено",
      });
    } else {
      tasks.splice(existingTaskIndex, 1);
      callback(null, {});
    }
  },
});
server.bindAsync(
  "127.0.0.1:8081",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (!err) {
      server.start();
      console.info("Сервер запущен на порту %d", port);
    }
  }
);
