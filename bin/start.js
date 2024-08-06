const inquirer = require('inquirer');
const prompt = require('./config/prompt');
const { outputEnvPagesManifestConf } = require('./tools/makeConfig');

function startDev(platform, updateConfig) {
  const promptEnv = prompt[platform] || prompt.app;
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'viteCompositionName',
        message: '请选择主体:',
        choices: promptEnv.projects,
        default: '老师家长学生',
      },
      {
        type: 'list',
        name: 'viteServerEnv',
        message: '请选择运行环境:',
        choices: promptEnv.envs,
        default: 'TEST2',
      },
      {
        type: 'list',
        name: 'viteAppName',
        message: '请选择运行的项目:',
        choices: promptEnv.apps,
        default: '麦塔校园',
      },
    ])
    .then(answers => {
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
          ...answers,
          viteComposition: viteCompositionMap[answers.viteCompositionName],
          vitePackage: viteAppNamePackageMap[answers.viteAppName],
        },
        platform,
        updateConfig,
      );
    });
}

module.exports = { startDev };
