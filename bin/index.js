#!/usr/bin/env node

const commander = require('commander');
const pkg = require('../package.json');

const program = new commander.Command();

program
  .name(Object.keys(pkg.bin)[0])
  .usage('[command] <options>')  // usage tip
  .version(pkg.version)
  .option('-d, --debug', '是否开启调试模式', false)
  .option('-e, --envName <envname>', '获取环境变量名称')

// command 注册命令
const clone = program.command('clone <source> [destination]');
clone
  .description('clone a repository')
  .option('-f, --force', '是否强制拷贝')
  .action((source, destination, cmdObj) => {
    console.log(source, destination, cmdObj.force);
  })

// addcommand注册子命令
const service = new commander.Command('service');
service
  .command('start [port]')
  .description('start service by port')
  .action((port) => {
    console.log('do service start', port)
  })

  program.addCommand(service)


program
  .parse(process.argv)
