const { parentPort } = require('node:worker_threads');
const Axios = require('axios');

const streams = [];

let hasPretty = false;
try {
  require.resolve('pino-pretty');
  hasPretty = true;
} catch {
  // no pretty
}

if (hasPretty) {
  const pinoPretty = require('pino-pretty');

  const prettyLog = pinoPretty.prettyFactory({
    colorize: true,
    translateTime: true,
  });

  streams.push((msg) => process.stdout.write(prettyLog(JSON.stringify(msg))));
} else {
  // eslint-disable-next-line no-console
  streams.push((msg) => console.log(JSON.stringify(msg)));
}

parentPort.on('message', (msg) => {
  const parsedMsg = JSON.parse(msg);

  for (const s of streams) s(parsedMsg);
});
