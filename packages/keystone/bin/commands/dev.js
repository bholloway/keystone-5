const path = require('path');
const { executeDefaultServer, getEntryFileFullPath } = require('../utils');
const { DEFAULT_PORT, DEFAULT_ENTRY } = require('../../constants');

module.exports = {
  // prettier-ignore
  spec: {
    '--port':  Number,
    '-p':      '--port',
    '--entry': String,
  },
  help: ({ exeName }) => `
    Usage
      $ ${exeName} dev --port=3000

    Options
      --port, -p  Port to start on [${DEFAULT_PORT}]
      --entry     Entry file exporting keystone instance [${DEFAULT_ENTRY}]
  `,
  exec: async (args, { exeName, _cwd = process.cwd() } = {}, spinner) => {
    spinner.text = 'Validating project entry file';
    const entryFile = await getEntryFileFullPath(args, { exeName, _cwd });
    spinner.succeed(`Validated project entry file ./${path.relative(_cwd, entryFile)}`);
    spinner.start(' ');
    await executeDefaultServer(args, entryFile, undefined, spinner);
    // Return a never-ending promise to keep the server alive
    return new Promise(resolve => {
      process.on('SIGINT', resolve);
      process.on('SIGTERM', resolve);
    });
  },
};
