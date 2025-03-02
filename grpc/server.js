import path from "path"
import { fileURLToPath } from "url"
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"

// Get the directory name using ESM pattern
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load the protobuf
const PROTO_PATH = path.join(__dirname, "proto/calculator.proto")

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const calculatorProto = grpc.loadPackageDefinition(packageDefinition).calculator

// Implement the Add RPC method
function add(call, callback) {
  const { a, b } = call.request
  console.log(`Received request to add ${a} and ${b}`)

  const result = a + b
  callback(null, { result })
}

// Create a gRPC server
function startServer() {
  const server = new grpc.Server()

  server.addService(calculatorProto.Calculator.service, {
    add: add,
  })

  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      console.error("Failed to bind server:", error)
      return
    }

    server.start()
    console.log(`Server running at http://0.0.0.0:${port}`)
  })
}

startServer()

