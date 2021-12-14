/*
 * @Description: 
 * @Author: rodchen
 * @Date: 2021-12-14 20:27:44
 * @LastEditTime: 2021-12-14 20:34:58
 * @LastEditors: rodchen
 */
const path = require('path')

module.exports = {
  entry: './bin/core.js',
  output: {
    path:  path.join(__dirname, '/dist'),
    filename: 'index.js'
  },
  mode: 'development'
}