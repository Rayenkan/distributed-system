import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the protobuf
const PROTO_PATH = path.join(__dirname, "proto/calculator.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const calculatorProto =
  grpc.loadPackageDefinition(packageDefinition).calculator;

// Create a gRPC client
const client = new calculatorProto.Calculator(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const app = express();
app.use(express.json());

// Check if gRPC server is available
function checkGrpcServer() {
  return new Promise((resolve) => {
    client.add({ a: 0, b: 0 }, (error) => {
      resolve(!error);
    });
  });
}

// Middleware to check gRPC server status
app.use(async (req, res, next) => {
  if (req.path === "/health") return next();

  const isServerAvailable = await checkGrpcServer();
  if (!isServerAvailable) {
    return res.status(503).json({
      error: "gRPC server is not available. Please make sure to run: npm start",
    });
  }
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "HTTP server is running" });
});

// GET endpoint - /add?a=5&b=3
app.get("/add", (req, res) => {
  const a = Number.parseInt(req.query.a);
  const b = Number.parseInt(req.query.b);

  if (isNaN(a) || isNaN(b)) {
    return res
      .status(400)
      .json({ error: "Both a and b must be valid numbers" });
  }

  client.add({ a, b }, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({
        error: "Failed to perform addition",
        details: error.message,
      });
    }
    res.json({ result: response.result });
  });
});

// POST endpoint - /add
app.post("/add", (req, res) => {
  const { a, b } = req.body;

  if (typeof a !== "number" || typeof b !== "number") {
    return res
      .status(400)
      .json({ error: "Both a and b must be valid numbers" });
  }

  client.add({ a, b }, (error, response) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({
        error: "Failed to perform addition",
        details: error.message,
      });
    }
    res.json({ result: response.result });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`HTTP Server running on http://localhost:3000`);
  console.log("Available endpoints:");
  console.log("  GET  /health         - Check server health");
  console.log(
    "  GET  /add?a=5&b=3    - Add two numbers using query parameters"
  );
  console.log("  POST /add            - Add two numbers using JSON body");
  console.log(
    "\nMake sure the gRPC server is running (npm start) in another terminal!"
  );
});
