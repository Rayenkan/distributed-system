import { spawn } from "child_process"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ANSI color codes for console output
const colors = {
  grpc: "\x1b[36m", // Cyan
  http: "\x1b[35m", // Magenta
  error: "\x1b[31m", // Red
  success: "\x1b[32m", // Green
  reset: "\x1b[0m", // Reset
}

function startService(name, command, args = []) {
  const color = name === "gRPC" ? colors.grpc : colors.http
  console.log(`${color}Starting ${name} server...${colors.reset}`)

  const service = spawn(command, args, {
    cwd: __dirname,
    shell: true,
  })

  service.stdout.on("data", (data) => {
    console.log(`${color}[${name}] ${data.toString().trim()}${colors.reset}`)
  })

  service.stderr.on("data", (data) => {
    console.error(`${colors.error}[${name} Error] ${data.toString().trim()}${colors.reset}`)
  })

  service.on("close", (code) => {
    if (code !== 0) {
      console.error(`${colors.error}[${name}] process exited with code ${code}${colors.reset}`)
    }
  })

  return service
}

// Handle process termination
function cleanup(services) {
  console.log("\n" + colors.success + "Shutting down services..." + colors.reset)
  services.forEach((service) => {
    service.kill()
  })
}

// Start both services
console.log(colors.success + "Starting services..." + colors.reset)

const services = [
  startService("gRPC", "npm", ["start"]),
  // Wait a bit before starting the HTTP server to ensure gRPC server is ready
  setTimeout(() => {
    services.push(startService("HTTP", "npm", ["run", "http"]))
  }, 1000),
]

// Handle process termination
process.on("SIGINT", () => cleanup(services))
process.on("SIGTERM", () => cleanup(services))
process.on("uncaughtException", (err) => {
  console.error(colors.error + "Uncaught Exception:", err + colors.reset)
  cleanup(services)
  process.exit(1)
})

