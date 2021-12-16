#!/usr/bin/env node

const commander = require('commander');
const colors = require('colors/safe');

const pkg = require('../package.json');
const gen = require('./swagger');
const writeFileApi = require('./create');
const { option } = require('commander');

const program = new commander.Command();

program
  .name(Object.keys(pkg.bin)[0])
  .usage('[command] <options>')  // usage tip
  .version(pkg.version)
  .option('-d, --debug', '是否开启调试模式', false)
  .option('-e, --envName <envname>', '获取环境变量名称')

  colors.red(1)
// command 注册命令
const init = program.command('init <sourceUrl>');
init
  .description('初始化swagger地址: bitsun-cli init http://47.100.87.54:9101/srm-ops/v2/api-docs')
  .action((sourceUrl, destination, cmdObj) => {
      console.log(colors.blue('开始初始化'))
      try {
        gen(sourceUrl).then(res => {
          console.log(colors.blue('初始化完成'))
        })
        .catch(e => {
          console.log(colors.red('error:', e.message))
        });
      } catch (e) {
        
      }
      
  })

// command 注册命令
const create = program.command('create <method> <sourceUrl> [businessname]');
create
  .description(`创建table页面: bitsun-cli create get /sku 商品编码

${colors.blue('Args参数：')}
method            get / post / delete / put / patch
sourceUrl         api地址
businessname      业务名称
  `)
  .action((method, sourceUrl, businessname) => {
      console.log(colors.blue('开始创建文件'))
      try {
        writeFileApi(method, sourceUrl, businessname || '基础')
      } catch (e) {
        console.log(e)
      }
      
  })

// 高级定制3: 未知命令监听
program.on('command:*', function(obj) {
  console.error('未知的命令')
  const availabledCommand = program.commands.map(cmd => cmd.name())
  console.log('可用命令: ' + availabledCommand.join(','))
})

program
  .parse(process.argv)
