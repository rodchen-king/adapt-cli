#!/usr/bin/env node

const lib = require('adapt-lib');

console.log('welcome adapt design pro')

const argv = require('process').argv;

// 第三个元素是command
const command = argv[2]

// 第四个元素是options
const options = argv.slice(3)

if (options.length > 1) {
  let [option, param] = options;
  option = option.replace('--', '')
  
  if (lib[command]) {
    lib[command](option, param)
  } else {
    console.log("请输入命令")
  }
}

// 实现全局参数解析--version
if (command.startsWith('--') || command.startsWith('-')) {
  const globalOption = command.replace(/--|-/g, '');

  if (globalOption == 'version' || globalOption == 'V') {
    console.log('1.0.0')
  }
}

