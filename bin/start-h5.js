const { outputEnvPagesManifestConf } = require('./tools/makeConfig');
const { reduce, find, assign, replace, toLower, toUpper } = require('lodash');
const { startDev } = require('./start');
// const { copyFile } = require('./tools/util');
/**库存在兼容性 需要替换 */
const copyMqtt = require('./tools/copy-mqtt');
copyMqtt();

/** 根据选项, 动态更改配置 */
const updateConfig = (jsonData, conf) => {
  jsonData.appid = conf['dcloudAppId'];
  jsonData.name = conf['appName'];
  jsonData.versionName = conf['appVersion'];
  jsonData['h5'].devServer.proxy = {
    '/api': {
      target: conf['target'],
      changeOrigin: true,
      secure: false,
    },
  };
};

/**
 * 命令行参数获取并返回
 * args: process.argv
 */
function getCmdArgs(args = []) {
  const cmdArgs = {};
  const cloneEnv = process.env;
  const pickKeys = ['project', 'env', 'kind']; // 要提取的环境变量
  const argv = JSON.parse(cloneEnv['npm_config_argv'] || '{}').original || [];
  args.splice(2).forEach(arg => {
    const [key] = arg.split('=');
    if (['serve', 'dev'].includes(key)) {
      cmdArgs.mode = key;
    }
  });
  const extendCmds = reduce(
    pickKeys,
    (mem, eKey) => {
      const regStr = `-${eKey}=`;
      const argValue = find(argv, arg => new RegExp(regStr).test(arg));
      if (argValue) mem[eKey] = replace(argValue, regStr, '');
      return mem;
    },
    {},
  );
  return assign(cmdArgs, extendCmds);
}

// function copyIndex(viteEnv) {
//   const cwd = process.cwd();
//   const env = ['DEV', 'TEST', 'PROD', 'PRE'].includes(viteEnv) ? viteEnv : 'TEST';
//   copyFile(`${cwd}/bin/config/${env}_index.html`, `${cwd}/index.html`, () => {});
// }

function cliStartup() {
  const { mode, project, ...answers } = getCmdArgs(process.argv);
  const newAnswers = {
    viteProjectKind: toLower(answers.kind),
    viteEnv: toUpper(answers.env),
    viteProject: project,
  };
  if (mode === 'serve') {
    // copyIndex(newAnswers.viteEnv);
    outputEnvPagesManifestConf(newAnswers, project, updateConfig);
  } else {
    startDev('h5', updateConfig);
  }
}

cliStartup();
