"use strict";

var esformatter = require('../lib/esformatter');
var fs = require('fs');
var rc = require('rc');
var optimist = require('optimist');
var stdin = require('stdin');


// ---


var config;
var argv = optimist
  .usage('esformatter [OPTIONS] [FILES]')
  .alias('c', 'config').describe('c', 'Path to custom configuration file.')
  .alias('p', 'preset').describe('p', 'Set style guide preset ("jquery", "default").')
  .alias('h', 'help').describe('h', 'Display help and usage details.')
  .alias('v', 'version').describe('v', 'Display the current version.')
  .string(['config', 'preset', 'indent.value', 'lineBreak.value', 'whiteSpace.value'])
  .boolean(['help', 'version'])
  .wrap(80);



exports.parse = function(str) {
  argv = optimist.parse(str);

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  if (argv.version) {
    console.log( 'esformatter v'+ require('../package.json').version );
    process.exit(0);
  }

  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (argv.preset) {
    config = argv;
  } else {
    config = getConfig();
  }

  processFiles(argv._);
};


// ---


function processFiles(files) {
  if (files.length === 0) {
    stdin(formatToConsole);
  } else {
    files.forEach(function(file) {
      formatToConsole(getSource(file));
    });
  }
}


function getSource(file) {
  try {
    return fs.readFileSync(file).toString();
  } catch (ex) {
    console.error("Can't read source file: " + file + "\nException: " + ex.message);
    process.exit(2);
  }
}


function getConfig() {
  var file = argv.config;
  if (! file) {
    // we only load ".esformatterrc" files if user did not provide a config
    // file as argument, that way we allow user to override the behavior easily
    return rc('esformatter', {});
  }
  if (!fs.existsSync(file)) {
    console.error("Can't find configuration file: " + file + "\nFile doesn't exist");
    process.exit(1);
  } else {
    try {
      return JSON.parse(fs.readFileSync(file).toString());
    } catch (ex) {
      console.error("Can't parse configuration file: " + file + "\nException: " + ex.message);
      process.exit(1);
    }
  }
}


function formatToConsole(source) {
  var result = esformatter.format(source, config);
  // do not use console.log since it adds a line break at the end
  process.stdout.write(result);
}

