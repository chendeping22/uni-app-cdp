const prompt = require('./config/prompt');
const { outputEnvPagesManifestConf } = require('./tools/makeConfig');
const { startDev } = require('./start');

/**库存在兼容性 需要替换 */
const copyMqtt = require('./tools/copy-mqtt');
copyMqtt();

/** 根据选项, 动态更改配置 */
const updateConfig = (jsonData, conf) => {
  jsonData.appid = conf['dcloudAppId'];
  jsonData.name = conf['appName'];
  jsonData.versionName = conf['appVersion'];
  jsonData['app-plus'].distribute.sdkConfigs.share.weixin = {
    appid: conf['wxShareAppId'],
    UniversalLinks: conf['wxSharUniversalLinks'],
  };
};

const args = process.argv.splice(2);
if (args.length > 2) {
  // { viteCompositionName: '老师家长学生', viteEnv: 'TEST', vitePackage: '麦塔校园' ,appVersion:'0.1.0.1' }

  const [viteCompositionName, originEnv, viteAppName, appVersion] = args;
  const viteServerEnv = originEnv === 'test_tmp' ? 'TEST2' : originEnv.toLocaleUpperCase();
  const viteCompositionMap = {};
  prompt.app.projects.forEach((item, index) => {
    viteCompositionMap[item] = prompt.app.kinds[index];
  });
  const viteAppNamePackageMap = {};
  prompt.app.apps.forEach((item, index) => {
    viteAppNamePackageMap[item] = prompt.app.packages[index];
  });
  outputEnvPagesManifestConf(
    {
      viteCompositionName,
      viteServerEnv,
      viteAppName,
      appVersion,
      viteComposition: viteCompositionMap[viteCompositionName],
      vitePackage: viteAppNamePackageMap[viteAppName],
    },
    'app',
    updateConfig,
    true,
  );
} else {
  startDev('app', updateConfig);
}
