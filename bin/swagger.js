#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const parse = require('swagger-parser')
const colors = require('colors/safe');
const pkg = require('pkg-dir')
const beautify = require('js-beautify').js_beautify;

// api接口方法存放目录
const API_PATH = path.resolve(process.cwd(), './dataBasic')
// console.log(pkg.sync())

let modelData;

// 判断目录是否存在
const isExist = (lastPath = '') => {
  const privatePath = `${lastPath ? API_PATH + '/' + lastPath : API_PATH}`
  const stat = fs.existsSync(privatePath)
  if (!stat) {
    fs.mkdirSync(privatePath)
  }
  if (!lastPath) {
    const configPath = `${API_PATH}/config.tsx`
    // api 目录下写入 config文件
    fs.access(configPath, function (err) {
      if (err && err.code === 'ENOENT') {
        fs.writeFileSync(`${API_PATH}/config.tsx`, 'export const ip = \'https://test.××××.com/\'')
      }
    })
  }
}
// 模块名称整理
const moduleName = (operationId) => {
  return operationId.replace(/Using|_/g, '');
}
// 数据类型
const dataType = (key) => {
  const type = {
    string: 'string',
    integer: 'number',
    int: 'number',
    long: 'string',
    Array: 'array',
    file: 'Blob',
    boolean: 'boolean'
  }
  return type[key] ? type[key] : 'any'
}


// 整理出相同模块路径
const getModules = (map) => {
  let moduleList = [];
  map.forEach((value, key) => {
    const module = writeFileApi(key, value);
    moduleList = [...moduleList, ...module];
  });
  return moduleList;
}

// 参数模板参数数组
const interfaceParamsList = (params) => {
  let str = '';
      // "${item.name}": ${dataType(item.type)}; 

  params.forEach(item => {
    str = `${str}
    "${item.name}": "${item.description ? item.description : ''}",`
  })
  return str;
}

const interfaceResponseList = (properties) => {
  let str = '';
      // "${item.name}": ${dataType(item.type)}; 

  Object.keys(properties).forEach(item => {
    str = `${str}
    "${item}": "${properties[item].description}",`
  })
  return str;
}

// 参数模板
const interfaceParamsTpl = (params, interfaceName, type) => {
  if (!params || params.length === 0) {
    return '';
  } else {
    return `const ${type} = {${interfaceParamsList(params)}
}`
  }
};

// 写入模板
const tplInsertApi = (apiInfo) => {
  const keys = Object.keys(apiInfo);
  const method = keys[0];
  const methodParams = apiInfo[method];
  const parameters = methodParams.parameters;
  const operationId = methodParams.operationId;
  const allPath = apiInfo.allPath;
  const requestName = moduleName(operationId);
  let interfaceName = 'any';
  let interfaceParams = 'data?:any';
  let parametersType = 'data';
  if (parameters && parameters.length > 0) {
    interfaceName = `${requestName}Ife`;
    interfaceParams = `data: ${interfaceName}`;
  }
  if (method.toLocaleLowerCase() === 'get') {
    parametersType = 'params';
    interfaceParams = `params: ${interfaceName}`;
  }

  return `${interfaceParamsTpl(parameters, interfaceName, 'request')}
  `;

  // export async function ${requestName}(${interfaceParams}Request) {
  //   return Request('${allPath}', {
  //     ${parametersType},
  //     method: '${method}'
  //   });
  // }
}

// 写入模板
const tplInsertApiResposne = (apiInfo) => {
  if (apiInfo.allPath == '/skuLineImport/check') {
    debugger
  }
  const keys = Object.keys(apiInfo);
  const method = keys[0];
  const methodParams = apiInfo[method];
  const resposneP = methodParams.responses[200];
  const modelName = resposneP.schema.originalRef;
  let responseModel = modelData[modelName]
  let data = responseModel.properties.data
  if (data) {
    if (data.originalRef) {
      let firstRef = modelData[data.originalRef];

      if (firstRef.properties.items) {
        let returnModel = modelData[firstRef.properties.items.items.originalRef];
        let propertysArray = returnModel.properties;

        if (propertysArray) {
          let str = '';
          // "${item.name}": ${dataType(item.type)}; 

          return `const response = {${interfaceResponseList(propertysArray)}
}`
        }
      } else if (firstRef.properties.list) {
        let returnModel = modelData[firstRef.properties.list.items.originalRef];
        let propertysArray = returnModel.properties;

        if (propertysArray) {
          let str = '';
          // "${item.name}": ${dataType(item.type)}; 

          return `const response = {${interfaceResponseList(propertysArray)}
}`
        }
      } else {
        let propertysArray = firstRef.properties;

        if (propertysArray) {
          let str = '';
          // "${item.name}": ${dataType(item.type)}; 

          return `const response = {${interfaceResponseList(propertysArray)}
}`
        }
      }

    } else if (data.additionalProperties) {
      return `const response = {${JSON.stringify(data.additionalProperties)}
    }`
    } else if (data.items) {
      let returnModel = modelData[data.items.originalRef];
        let propertysArray = returnModel.properties;

        if (propertysArray) {
          let str = '';
          // "${item.name}": ${dataType(item.type)}; 

          return `const response = {${interfaceResponseList(propertysArray)}
}`
        }
    } else if (data.type === 'object') {
      return `const response = ${'object'}`
    } else {
      debugger
    }
  }

  return ``;

  // export async function ${requestName}(${interfaceParams}Request) {
  //   return Request('${allPath}', {
  //     ${parametersType},
  //     method: '${method}'
  //   });
  // }
}

// 模板名
const getModulesName = (apiInfo) => {
  const keys = Object.keys(apiInfo);
  const method = keys[0];
  const methodParams = apiInfo[method];
  const operationId = methodParams.operationId;
  return operationId;
}

function getOperationId(item) {
  let result = ''

  const keys = Object.keys(item);
  const method = keys[0];

  result += method

  result = result + '-' + item.allPath.replace(/\//g, '')
  return result
}

// 写入tsx
const writeFileApi = (fileName, apiData) => {
  // index.tsx
  const apiDataLen = apiData.length;
  let moduleList = [];
  for (let i = 0; i < apiDataLen; i++) {
    let tplIndex = '';
    const item = apiData[i];
    tplIndex = `${tplIndex}${tplInsertApi(item)}\n`;
    tplIndex = `${tplIndex}\n${tplInsertApiResposne(item)}\n`; 
    tplIndex = `${tplIndex}\nmodule.exports = {
      request,
      response
    }`; 


    fs.writeFileSync(`${API_PATH}/${getOperationId(item)}.js`, tplIndex);
    moduleList.push(getModulesName(item));
  }
  // tplIndex = beautify(tplIndex, { indent_size: 2, max_preserve_newlines: 2 });
  return moduleList;
}

const gen = async (swaggerUrl) => {
  isExist();
  // try {
    // 解析url 获得
    const parsed = await parse.parse(swaggerUrl)
    modelData = parsed.definitions
    const paths = parsed.paths
    const pathsKeys = Object.keys(paths)	// 获取url路径
    const pathsKeysLen = pathsKeys.length
    const modulesMap = new Map()
    for (let i = 0; i < pathsKeysLen; i++) {
      const item = pathsKeys[i]
      const itemAry = item.split('/')
      const pathsItem = paths[item]
      let fileName = itemAry[1]
      if (!fileName) continue
      fileName = fileName.toLowerCase()
      // 完整路径
      pathsItem.allPath = item
      if (modulesMap.has(fileName)) {
        const fileNameAry = modulesMap.get(fileName)
        fileNameAry.push(pathsItem)
        modulesMap.set(fileName, fileNameAry)
      } else {
        modulesMap.set(fileName, [pathsItem])
      }
    }
    getModules(modulesMap)
  // } catch (e) {
  //   console.log(colors.red('error:', e.message))
  // }
};

module.exports = gen
