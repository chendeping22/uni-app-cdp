const { startDev } = require('./start');

/**库存在兼容性 需要替换 */
const copyMqtt = require('./tools/copy-mqtt');
copyMqtt();

//微信小程序自动构建使用参数
const prompt = require('./config/prompt');
const { outputEnvPagesManifestConf } = require('./tools/makeConfig');

/** 根据选项, 动态更改配置 */
const updateConfig = (jsonData, conf) => {
  jsonData.appid = conf['dcloudAppId'];
  jsonData.name = conf['appName'];
  jsonData['mp-weixin'].appid = conf['wxAppId'];
  jsonData['h5'].devServer.proxy = {
    '/api': {
      target: conf['target'],
      changeOrigin: true,
      secure: false,
    },
  };
};

/**
 * 微信参数化构建
  { viteCompositionName: '老师家长学生', viteEnv: 'TEST', vitePackage: '麦塔校园' ,appVersion:'0.1.0.1' }
  const [viteCompositionName, originEnv, viteAppName, appVersion] = args;
 */
const args = process.argv.splice(2);
if (args.length > 2) {
  // { viteCompositionName: '老师家长学生', viteEnv: 'TEST', vitePackage: '麦塔校园' ,appVersion:'0.1.0.1' }
  const [viteCompositionName, originEnv, viteAppName, appVersion, appDesc] = args;
  const viteServerEnv = originEnv === 'test_tmp' ? 'TEST2' : originEnv.toLocaleUpperCase();
  const viteCompositionMap = {};
  prompt.app.projects.forEach((item, index) => {
    viteCompositionMap[item] = prompt.app.kinds[index];
  });
  console.log('prompt.app.projects===>', JSON.stringify(prompt.app.projects));
  console.log('viteCompositionMap ===>', viteCompositionMap);

  const viteAppNamePackageMap = {};
  prompt.app.apps.forEach((item, index) => {
    viteAppNamePackageMap[item] = prompt.app.packages[index];
  });

  const answers = {
    viteCompositionName,
    viteServerEnv,
    viteAppName,
    appVersion,
    viteComposition: viteCompositionMap[viteCompositionName],
    vitePackage: viteAppNamePackageMap[viteAppName],
  };
  outputEnvPagesManifestConf(answers, 'wx', updateConfig, true);
} else {
  startDev('wx', updateConfig);
}

//原有老旧代码
// startDev('wx', updateConfig);
