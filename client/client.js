const PROTO_PATH = "../tasks.proto";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const TaskService = grpc.loadPackageDefinition(packageDefinition).TaskService;
const client = new TaskService(
  "127.0.0.1:8081",
  grpc.credentials.createInsecure()
);
module.exports = client;
