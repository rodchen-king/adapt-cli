const fs = require('fs')
const path = require('path')
const parse = require('swagger-parser')
const colors = require('colors/safe');
const pkg = require('pkg-dir')

 
// 文件夹路径
// let filePath = path.resolve('./src');
 
// fileDisplay(filePath);

let count = 0
let errorCount = 0;

function findFileMappingPath(filePath) {
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function(err, files) {
    if (err) {
        console.error(err, "读取文件失败")
    } else {
        //遍历读取到的文件列表
        files.forEach(function(filename) {
            //获取当前文件的绝对路径
            let fileDir = path.join(filePath, filename);
            //根据文件路径获取文件信息
            fs.stat(fileDir, function(err, stats) {
                if (err) {
                    console.error('获取文件信息失败');
                } else {
                    let isFile = stats.isFile(); 
                    let isDir = stats.isDirectory(); 
                    if (isFile) {
                      checkpathname(fileDir)
                    }
                    if (isDir) {
                        //是文件夹，继续递归
                        findFileMappingPath(fileDir); 
                    }
                }
            })
        });
    }
});
}

function checkpathname(fileName) {
  console.log('check path')

  var buttonContent = fs.readFileSync(path.join(process.cwd() , './button.js'), 'utf-8');

  var exc1 = new RegExp('\/[^:]*:', 'g')
 
  buttonContent = buttonContent.match(exc1)
  // console.log(buttonContent)
  var content = fs.readFileSync(fileName, 'utf-8');
  buttonContent.map(item => {
    item = item.replace('.tsx', '').slice(0, -2)
    var exc = new RegExp(`\{[^{}]*${item}'[^{}]*\}`, 'g')

    try {
      content.match(exc)?.map(inneritem => {
        // console.log('+++++++++++++++++++++++++++++++++++++++++++++++++')
        // console.log(item)
        // console.log('inneritem', inneritem)
        inneritem = inneritem.match('path: (\'|\")[^,]*,', 'g')[0]
        // console.log(inneritem.slice(7, -2))


        // 替换内容
        let buttonContent = fs.readFileSync(path.join(process.cwd() , './button.js'), 'utf-8').replace(item, inneritem.slice(7, -2));
        fs.writeFileSync(path.join(process.cwd() , './button.js'), buttonContent , 'utf8')
      })
    } catch(e) {
      console.log('error', item)
      console.log(content.match(exc))
    }
  })


//   content = content.replace(/\s+|\s+/g, '').replace(/\#\{[^{}]*\}/g, '').replace(/style: \{[^{}]*\}\,*/g, '').replace(/disabled: \([^{}]*\) => \{[^{}]*\}/g, '')
  // if (exc.test(content)) {
  //   console.log(fileName)
  //   content.match(exc).map(item => {
      
  //   })
  // }
}
 
function check(fileName) {
  var content = fs.readFileSync(fileName, 'utf-8');
//   var exc = new RegExp('\{[^{]*code: \'drp[^}]*\}', 'g');
  var exc = new RegExp('\{[^{}]*(\{[^{}]*\})*[^{}]*code:(\'|\")drp[^}]*\}', 'g')
//   var exc = new RegExp('\{[^{}]*(\{[^{}]*\})*[^{}]*code: \'drp[^{}]*([^{}]*\{[^{}]*\}[^{}]*)*[^{}]*\}', 'g')
//   var exc = new RegExp('\{[^{}]*(\{[^{}]*\})*[^{}]*code: \'drp[^{}]*([^{}]*\{[^{}]*\}[^{}]*)*[^{}]*\}', 'g')
//   var exc = new RegExp('\{[^{}]*(\{[^{}]*\})*[^{}]*code: \'drp[^{}]*([^{}]*\{[^{}]*\}[^{}]*)*[^{}]*\}', 'g')

  content = content.replace(/\s+|\s+/g, '').replace(/\#\{[^{}]*\}/g, '').replace(/style: \{[^{}]*\}\,*/g, '').replace(/disabled: \([^{}]*\) => \{[^{}]*\}/g, '')

//   content = content.replace(/\s+|\s+/g, '').replace(/\#\{[^{}]*\}/g, '').replace(/style: \{[^{}]*\}\,*/g, '').replace(/disabled: \([^{}]*\) => \{[^{}]*\}/g, '')
  if (exc.test(content)) {
    // console.log(fileName)
    const path = fileName.replace(/\\/g, '/').replace('/index.tsx', '').slice(9)
    writeFile(`\n'${path}': [`)
    // console.log(content.match(exc).length)
    content.match(exc).map(item => {
      item = item.replace(/[\r]/g, "").replace(/[\n]/g, "").replace(/\$/g, "").replace('\`', 'g').replace(/render: [^]*(\{[^]*\})*[^]*\}/, '}')
      // console.log('++++++++++++++++++++++++++++++++++++')
      try {
        // console.log(item.match('children:(\s|\'|\")*[^\,]+', 'g')[0], item.match('code:(\'|\")drp[^\,]+', 'g')[0])
        count++
        writeFile(`{
          ${item.match('children:(\s|\'|\")*[^\,]+', 'g')[0].replace('children', 'name')},
          ${item.match('code:(\'|\")drp[^\,]+', 'g')[0]}
        },`)
      } catch(e) {
          console.error(item)
          errorCount++
      }
    //   console.log(JSON.parse(item))
    })
    writeFile(`],`)

    // console.log('count++', count)
    // console.log('errorCount++', errorCount)
  }
}

// 遍历文件夹
const fileDisplay = (filePath) => {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function(err, files) {
        if (err) {
            console.error(err, "读取文件失败")
        } else {
            //遍历读取到的文件列表
            files.forEach(function(filename) {
                //获取当前文件的绝对路径
                let fileDir = path.join(filePath, filename);
                //根据文件路径获取文件信息
                fs.stat(fileDir, function(err, stats) {
                    if (err) {
                        console.error('获取文件信息失败');
                    } else {
                        let isFile = stats.isFile(); 
                        let isDir = stats.isDirectory(); 
                        if (isFile) {
                            // 是文件，打印文件路径
                            console.log(fileDir)
                            check(fileDir)
                            // console.log(content);
                        }
                        if (isDir) {
                            //是文件夹，继续递归
                            fileDisplay(fileDir); 
                        }
                    }
                })
            });
        }
    });
}

const writeFile = (tplIndex) => {
  fs.appendFileSync(`${process.cwd()}/button.js`, tplIndex);
}

module.exports = {
  fileDisplay,
  writeFile,
  findFileMappingPath
}
