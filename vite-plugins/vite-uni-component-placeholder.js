const fs = require('fs');
const path = require('path');

exports = module.exports = function UniComponentPlaceholder() {
  // 存储所有数据
  let moduleInfo = [];
  // 存储最后一条数据
  let moduleRenew = [];
  // 存储当前时间
  let currentTime = '';
  // 判断初始化
  let initModules = true;
  // 获取dist
  const uniOutDir = process.env.UNI_OUTPUT_DIR;
  // 获取src目录path
  const basePath = process.env.UNI_INPUT_DIR;

  return {
    name: 'vite-uni-component-placeholder',
    transform(code, id) {
      // 获取所有
      moduleInfo.push({ id, code });
      // 获取最后一条数据
      moduleRenew = { id, code };
    },
    /**
     * buildEnd之后执行
     * initModule：初始化
     * renewModule：只刷新一个文件
     */
    closeBundle: () => {
      // 获取当前时间
      currentTime = new Date().toLocaleTimeString();
      // 初始化判断
      initModules ? initModule() : renewModule();
    },
  };

  // 初始化
  function initModule() {
    moduleInfo.forEach(module => {
      componentsMatch(module);
    });
    initModules = false;
  }

  // 刷新当前编辑文件，其实就是最后一条数据
  function renewModule() {
    componentsMatch(moduleRenew);
  }

  function componentsMatch(module) {
    if (module.id.endsWith('.vue') || module.id.endsWith('.js') || module.id.endsWith('.ts')) {
      // 获取正确的路径，去掉?后面参数，例如：?param=value
      let resetPath = module.id.split('?')[0];
      // 获取两路径对比差值
      const pathDifference = getPathDifference(basePath, resetPath);
      /**
       * 获取build路径后，将.vue后缀名修改成.json，获取打包后的json文件
       * uniOutDir：uni build之后的路径
       * pathDifference：对比路径
       */
      const resultPath = (uniOutDir + pathDifference).replace(/\.(vue|js)/g, '.json');

      // 获取componentPlaceholder信息
      const match = module.code.match(/componentPlaceholder\s*[:=]\s*{([\s\S]*?)}/);
      if (match && match[1]) {
        // 获取componentPlaceholder文件后，组成数组
        let components = match[1]
          .trim()
          .replace(/,\s*$/, '') // 删除最后一个号码
          .replace(/\s+/g, '') // 替换所有空格制表符换行符
          .replace(/(\w+):/g, '"$1":') // 以冒号结尾的字段转换成双引号
          .replace(/'/g, '"'); // 将所有字段单引号转换成双引号
        let Obj = JSON.parse(`{${components}}`);
        // 写入小程序json文件
        writeFileJson(resultPath, Obj);
      } else if (!initModules) {
        const Obj = '';
        // 写入小程序json文件
        writeFileJson(resultPath, Obj);
      }
    }
  }

  // 写入小程序json文件
  function writeFileJson(resultPath, Obj) {
    // 读取json文件
    fs.readFile(resultPath, 'utf8', (err, data) => {
      if (err) {
        // return console.log('componentPlaceHolder文件读取失败，失败原因是：' + err)
      } else {
        let baseJSON = JSON.parse(data);
        // 判断Obj，如果为空，则删除小程序json文件中的componentPlaceholder
        Obj ? (baseJSON.componentPlaceholder = Obj) : delete baseJSON.componentPlaceholder;
        // 重写json文件
        fs.writeFileSync(resultPath, JSON.stringify(baseJSON, null, 4));
      }
    });
  }

  // 获取两路径对比差值
  function getPathDifference(basePath, relativePath) {
    // 使用path.relative获取相对路径
    const relative = path.relative(basePath, relativePath);
    // 如果是相同路径，则返回空字符串，否则返回相对路径
    return relative === '' ? '' : '/' + relative.replace(/\\/g, '/');
  }
};
