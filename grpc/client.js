import path from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Create a client instance
const client = new calculatorProto.Calculator(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Function to add two numbers
function addNumbers(a, b) {
  return new Promise((resolve, reject) => {
    client.add(
      { a: Number.parseInt(a), b: Number.parseInt(b) },
      (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response.result);
      }
    );
  });
}

// Handle command line arguments
async function main() {
  // Get numbers from command line arguments
  const args = process.argv.slice(2);

  if (args.length === 2) {
    // If two numbers are provided as arguments
    const [a, b] = args;
    try {
      const result = await addNumbers(a, b);
      console.log(`Sum of ${a} and ${b} is: ${result}`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  } else {
    // Example usage of the function
    console.log("No arguments provided. Here are some example calculations:");

    // Example 1
    try {
      const result1 = await addNumbers(5, 3);
      console.log("5 + 3 =", result1);
    } catch (error) {
      console.error("Error:", error.message);
    }

    // Example 2
    try {
      const result2 = await addNumbers(10, 20);
      console.log("10 + 20 =", result2);
    } catch (error) {
      console.error("Error:", error.message);
    }

    console.log("\nTo use: node client.js <number1> <number2>");
    console.log("Example: node client.js 5 7");
  }
}

main().catch(console.error);
