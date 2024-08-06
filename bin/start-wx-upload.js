//微信小程序上传使用参数
const ci = require('miniprogram-ci');
const path = require('path');
const prompt = require('./config/prompt');

/** 上传打包后的文件
 * { viteCompositionName: '老师家长学生', viteEnv: 'TEST', vitePackage: '麦塔校园' ,appVersion:'0.1.0.1' }
 * const [viteCompositionName, originEnv, viteAppName, appVersion] = args;
 */
const uploadWxApp = async (args, answers) => {
  const [viteCompositionName, originEnv, viteAppName, appVersion, appDesc] = args;
  //获取应用配置信息
  const appConfig = require(path.resolve(__dirname, 'source', `${answers.vitePackage}.json`));
  //获取应用私密配置信息
  const appId = appConfig.env[answers.viteServerEnv.toLowerCase()].wxAppId;
  const keyPath = path.resolve(__dirname, 'wx', 'ci', `private.${appId}.key`);
  const projectDir = path.resolve(__dirname, '..', 'dist', 'build', 'mp-weixin');

  console.log('=====================args=====================', originEnv);
  console.log('=====================answers=====================', answers);
  console.log(
    '=====================appConfig=====================',
    appConfig.env[answers.viteServerEnv.toLowerCase()],
  );
  console.log('=====================privateKeyPath=====================', keyPath);
  console.log('=====================projectPath=====================', projectDir);
  console.log('=====================appId=====================', appId);
  // ci 初始化
  const project = new ci.Project({
    appid: appId,
    type: 'miniProgram',
    projectPath: projectDir,
    privateKeyPath: keyPath, // 此处引入小程序对应的私钥
    ignores: ['node_modules/**/*'],
  });
  console.log('===================== 微信小程序代码上传开始 ===================');
  //编译设置：https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html
  //https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html
  /**
    setting: {
      es6: true,
      minify: true,
      minifyJS: true,
      minifyWXML: true,
      ignoreUploadUnusedFiles: true,
      enhance: true,
    }

    setting: {
      useProjectConfig: true,
    },
   */

  const uploadResult = await ci.upload({
    project,
    robot: 1,
    version: appVersion,
    desc: `[自动构建]${appVersion} ${appDesc} `,
    setting: {
      es6: false,
      minify: true,
      minifyJS: true,
      minifyWXML: true,
      ignoreUploadUnusedFiles: true,
      enhance: true,
    },
    onProgressUpdate: console.log,
    threads: 6,
  });
  console.log(uploadResult);
  console.log('===================== 微信小程序代码上传结束 ===================');
  process.exit(0);
};

/**
 * 微信参数化构建
  { viteCompositionName: '老师家长学生', viteEnv: 'TEST', vitePackage: '麦塔校园' ,appVersion:'0.1.0.1' }
  const [viteCompositionName, originEnv, viteAppName, appVersion] = args;
 */
const args = process.argv.splice(2);
if (args.length > 2) {
  // { viteCompositionName: '老师家长学生', viteEnv: 'TEST', vitePackage: '麦塔校园' ,appVersion:'0.1.0.1' }
  const [viteCompositionName, originEnv, viteAppName, appVersion] = args;
  // const tempArgs = ['老师家长学生', 'dev', '麦塔校园', '1.0.0.17','应用描述'];
  // const [viteCompositionName, originEnv, viteAppName, appVersion] = tempArgs;
  const viteServerEnv = originEnv === 'test_tmp' ? 'TEST2' : originEnv.toLocaleUpperCase();
  const viteCompositionMap = {};
  prompt.app.projects.forEach((item, index) => {
    viteCompositionMap[item] = prompt.app.kinds[index];
  });

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
  console.log('[微信小程序上传] prompt.app.projects===>', JSON.stringify(prompt.app.projects));
  console.log('[微信小程序上传]   viteCompositionMap ===>', viteCompositionMap);
  console.log('[微信小程序上传]  answer====>', answers);
  //开始上传同步微信小程序
  uploadWxApp(args, answers);
} else {
  console.log('[微信小程序上传] 终止--->参数非法');
}
