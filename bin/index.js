#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const dedent = require('dedent')

const argv = hideBin(process.argv);

const cli = yargs(argv);

cli
  .usage('Usage: adapt-cli [command] <options>')  // usage tip
  .demandCommand(1, "A command is required. Pass --help to see all available commands and options.") // 最少传入的command数量
  .strict()
  .alias("h", "help")  // 别名
  .alias("v", "version")
  .wrap(cli.terminalWidth())  // 命令的宽度 cli.terminalWidth 占满
  .epilogue(dedent` 
      When a command fails, all logs are written to lerna-debug.log in the current working directory.

      For more information, find our manual at https://github.com/lerna/lerna
    `) // dedent不需要缩进
  .options({
     debug: {
       type: 'boolean',
       describe: 'bootstrap debug mode',
       alias: 'd'
     }
  })
  .options('registry', {
    type: 'boolean',
    // hidden: true
    describe: 'define global registry',
    alias: 'r'
  })
  .group(['debug'], 'Dev Options') // 分组
  .group(['registry'], 'Publish Options') // 分组
  .argv;