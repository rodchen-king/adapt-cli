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
  .parse(process.argv)

console.log(program.debug)
console.log(program.envName)

program.outputHelp();
console.log(program.opts())
