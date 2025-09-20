import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import net from 'net'

let proc: ChildProcess | null = null

function waitForPort(port: number, host = '127.0.0.1', timeout = 10000) {
  const start = Date.now()
  return new Promise<void>((resolve, reject) => {
    ;(function check() {
      const socket = new net.Socket()
      socket.setTimeout(1000)
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - start > timeout) return reject(new Error('port wait timeout'))
        setTimeout(check, 200)
      })
      socket.once('timeout', () => {
        socket.destroy()
        if (Date.now() - start > timeout) return reject(new Error('port wait timeout'))
        setTimeout(check, 200)
      })
      socket.connect(port, host, () => {
        socket.end()
        resolve()
      })
    })()
  })
}

export async function startServer() {
  const port = 5173
  // If port is already in use assume server is ready
  try {
    await waitForPort(port, '127.0.0.1', 500)
    return
  } catch (e) {
    // port not open, proceed to spawn server
  }

  const script = path.resolve(process.cwd(), 'scripts', 'serve-dist.cjs')
  proc = spawn(process.execPath, [script], {
    env: process.env,
    stdio: ['ignore', 'ignore', 'ignore'],
  })

  // Wait for the port to be open
  await waitForPort(port, '127.0.0.1', 10000)
}

export async function stopServer() {
  if (proc && !proc.killed) {
    proc.kill()
    proc = null
  }
}
