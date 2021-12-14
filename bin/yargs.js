#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const log = require("npmlog");

const dedent = require('dedent')

const argv = hideBin(process.argv);

const cli = yargs();
const pkg = require("../package.json");

const context = {
  lernaVersion: pkg.version,
};

cli
  .usage('Usage: adapt-cli [command] <options>')  // usage tip
  .demandCommand(1, "A command is required. Pass --help to see all available commands and options.") // 最少传入的command数量
  .strict()
  .recommendCommands() // 命令提示
  // .fail((err, msg) => {
  //   // certain yargs validations throw strings :P
  //   const actual = err || new Error(msg);

  //   // ValidationErrors are already logged, as are package errors
  //   if (actual.name !== "ValidationError" && !actual.pkg) {
  //     // the recommendCommands() message is too terse
  //     if (/Did you mean/.test(actual.message)) {
  //       log.error("adapt-cli", `Unknown command "${cli.parsed.argv._[0]}"`);
  //     }

  //     log.error("adapt-cli", actual.message);
  //   }

  //   // exit non-zero so the CLI can be usefully chained
  //   cli.exit(actual.exitCode > 0 ? actual.exitCode : 1, actual);
  // }) // 自定义错误信息
  .alias("h", "help")  // 别名
  .alias("v", "version")
  .wrap(cli.terminalWidth())  // 命令的宽度 cli.terminalWidth 占满
  .epilogue(dedent` 
      When a command fails, all logs are written to adapt-cli-debug.log in the current working directory.

      For more information, find our manual at https://github.com/rodchen_king/adapt-cli
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
  .command('init [name]', 'Do init a project', (yargs) => {
    yargs.option('name', {
      type: 'string',
      describe: 'name of a project',
      alias: 'n'
    })
  }, (argv) => {
    console.log(argv)
  })
  .command({
    command: 'list',
    alias: ['ls', 'la', 'li'],
    describe: 'command list',
    builder: (yargs) => {

    },
    handler: (argv) => {
      console.log(argv)
    }
  })
  .parse(argv, context);