#!/usr/bin/env node

const commander = require('commander');
const colors = require('colors/safe');

const pkg = require('../package.json');
const gen = require('./swagger');
const { fileDisplay, writeFile, findFileMappingPath } = require('./create');
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
const create = program.command('run');
create
  .description(`搜集资源code: bitsun-cli run

${colors.blue('Args参数：')}
method            get / post / delete / put / patch
sourceUrl         api地址
businessname      业务名称
  `)
  .action((method, sourceUrl, businessname) => {
      console.log(colors.blue('开始创建文件'))
      try {
        // fileDisplay('./src//pages/AllocationManagement/TransferIssueDoc/')
        // fileDisplay('./src//pages/CommodityCenter/Brand/BrandManagement/')
        fileDisplay('./src/pages/')

      } catch (e) {
        console.log(e)
      }
      
  })

const convert = program.command('convert');
convert
  .description(`搜集资源code: bitsun-cli convert

${colors.blue('Args参数：')}
method            get / post / delete / put / patch
sourceUrl         api地址
businessname      业务名称
  `)
  .action((method, sourceUrl, businessname) => {
      console.log(colors.blue('开始转换文件'))
      try {

        findFileMappingPath('./config/router/')

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
