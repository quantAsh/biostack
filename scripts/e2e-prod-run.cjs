const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

function waitForPort(port, host, timeout = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      const sock = new net.Socket();
      sock.setTimeout(1000);
      sock.once('error', () => {
        sock.destroy();
        if (Date.now() - start > timeout) return reject(new Error('timeout'));
        setTimeout(check, 200);
      });
      sock.once('timeout', () => { sock.destroy(); if (Date.now() - start > timeout) return reject(new Error('timeout')); setTimeout(check, 200); });
      sock.connect(port, host, () => {
        sock.end();
        resolve();
      });
    })();
  });
}

(async function(){
  const serverScript = path.resolve(__dirname, 'serve-dist.cjs');
  const server = spawn(process.execPath, [serverScript], { stdio: ['ignore', 'inherit', 'inherit'] });
  console.log('spawned server', server.pid);
  try {
    await waitForPort(5173, '127.0.0.1', 10000);
    console.log('server ready');
    const runner = spawn('npx', ['playwright', 'test', 'tests/e2e/admin-lazy.spec.ts', '-c', 'playwright.config.ts', '-g', 'Admin lazy-load', '--headed', '--retries=1', '--reporter=list', '--trace', 'on-first-retry'], { stdio: 'inherit' });
    const code = await new Promise((res) => runner.on('exit', res));
    console.log('playwright exit', code);
    server.kill();
    process.exit(code);
  } catch (err) {
    console.error('failed', err);
    server.kill();
    process.exit(2);
  }
})();
