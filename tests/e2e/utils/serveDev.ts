import { spawn, ChildProcess } from 'child_process'
import net from 'net'

let proc: ChildProcess | null = null

function waitForPort(port: number, host = '127.0.0.1', timeout = 15000) {
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
      socket.connect(5173, host, () => {
        socket.end()
        resolve()
      })
    })()
  })
}

export async function startServer() {
  const port = 5173
  // If already listening, assume server exists
  try { await waitForPort(port, '127.0.0.1', 500); return } catch {}
  // Spawn vite dev server via npm script to ensure same flags
  proc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:ci'], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: '5173' },
    stdio: ['ignore', 'ignore', 'ignore'],
  })
  await waitForPort(port, '127.0.0.1', 20000)
}

export async function stopServer() {
  if (proc && !proc.killed) {
    try { proc.kill() } catch {}
    proc = null
  }
}
