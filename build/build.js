const path = require('path')
const fs = require('fs-extra')
const config = require('./config')

// 清空输出目录
fs.emptyDirSync(path.resolve(__dirname, '../dist'))
fs.emptyDirSync(path.resolve(__dirname, '../declaration'))

// 编译 js
const rollup = require('rollup')
const uglifyJS = require('uglify-js')
const buble = require('rollup-plugin-buble')

rollup.rollup({
  input: config.input,
  external: config.external,
  plugins: [
    config.tp,
    buble()
  ]
}).then(bundle => {
  // 输出 es 格式
  bundle.write({
    file: config.esOutputPath,
    format: 'es',
    banner: config.banner
  })

  // 输出 cjs 格式
  bundle.write({
    file: config.cjsOutputPath,
    format: 'cjs',
    banner: config.banner
  })

  // 输出 umd 格式
  bundle.generate({
    format: 'umd',
    name: config.name,
    globals: {
      superagent: 'superagent',
      'blueimp-md5': 'md5'
    },
    banner: config.banner
  }).then(({ code }) => {
    fs.writeFile(config.umdOutputPath, code)
    fs.writeFile(config.umdMinOutputPath, uglifyJS.minify(code, { output: { comments: /^!/ } }).code)
  })
})
