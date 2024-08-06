/**
 * @description 根据选项生成配置文件
 * @typedef {'wx'|'app'} syskind 系统类型
 */
const fs = require('fs');
const path = require('path');
const { transCamel, resolve } = require('./util');
const { unionBy } = require('lodash');

// 暴露js runtime 环境的变量
const envFileDir = resolve('env');
const envFilePath = `${envFileDir}/.env`;
const envFileComment = `## 这是公共配置环境变量文件;js runtime 中获取的变量
## 配置格式：VITE_[key]=value
## @example VITE_SERVER_ENV=DEV
`;

/*
 * 输出到pages.json文件
 */
function outputEnv(answers, appConfig) {
  let envContent = [envFileComment];

  envContent.push(`VITE_APP_NAME=${appConfig.appName}`);
  envContent.push(`VITE_APP_VERSION=${appConfig.appVersion}`);
  envContent.push(`VITE_APP_OFFICIA_URL=${appConfig.appOfficiaUrl}`);
  envContent.push(`VITE_WX_ID=${appConfig.env[answers.viteServerEnv.toLowerCase()].wxId}`);
  envContent.push(`VITE_WX_APP_ID=${appConfig.env[answers.viteServerEnv.toLowerCase()].wxAppId}`);
  envContent.push(`VITE_WX_WEB_URL=${appConfig.env[answers.viteServerEnv.toLowerCase()].wxWebUrl}`);
  envContent.push(`VITE_COMPOSITION=${answers.viteComposition}`);
  envContent.push(`VITE_SERVER_ENV=${answers.viteServerEnv}`);
  envContent.push(
    `VITE_SERVER_URL=${appConfig.env[answers.viteServerEnv.toLowerCase()].impUrlNew}`,
  );
  envContent.push(
    `VITE_LOW_CODE_SERVER_URL=${appConfig.env[answers.viteServerEnv.toLowerCase()].lowCodeUrl}`,
  );
  envContent.push(
    `VITE_TRAINING_SERVER_URL=${appConfig.env[answers.viteServerEnv.toLowerCase()].trainingUrl}`,
  );
  envContent.push(
    `VITE_SERVER_URL_OLD=${appConfig.env[answers.viteServerEnv.toLowerCase()].impUrlOld}`,
  );
  envContent.push(
    `VITE_EDU_SERVER_URL_OLD=${appConfig.env[answers.viteServerEnv.toLowerCase()].eduUrlOld}`,
  );
  envContent.push(
    `VITE_STU_SERVER_URL_OLD=${appConfig.env[answers.viteServerEnv.toLowerCase()].stuUrlOld}`,
  );
  envContent.push(
    `VITE_FOLLOW_GUIDE_SRC=${appConfig.env[answers.viteServerEnv.toLowerCase()].followGuideSrc}`,
  );

  // 输出环境配置
  if (!fs.existsSync(envFileDir)) {
    fs.mkdirSync(envFileDir);
  }
  fs.writeFileSync(envFilePath, envContent.join('\r\n'));
}

/*
 * 输出到pages.json文件
 */
function outputPagesConf(inFiles, outFile) {
  let allData = {};
  let firstAppData = {};
  inFiles.forEach((element, index) => {
    const data = fs.readFileSync(element);
    const value = data
      .toString()
      .replace(/\/\*{1,2}[\s\S]*?\*\//g, '') // 去除多行注释
      .replace(/\/\/\W.*(\r|\n)/g, ''); // 去除单行注释（仅'// *'后面带空格的才能匹配, 否则碰到url会误匹配）
    const jsonData = JSON.parse(value);
    if (index == 1) {
      firstAppData = jsonData;
    }
    allData = mergeObjects(allData, jsonData);
  });
  // 如果是组合app 取第一个app的tabbar
  if (inFiles && inFiles.length > 2) {
    allData = {
      ...allData,
      ...{
        tabBar: firstAppData.tabBar,
      },
    };
  }

  fs.writeFileSync(outFile, JSON.stringify(allData));
}

function mergeObjects(objA, objB) {
  const newObj = { ...objA };
  Object.keys(objB).forEach(key => {
    if (Array.isArray(newObj[key]) && Array.isArray(objB[key])) {
      if (key === 'pages') {
        newObj[key] = unionBy(newObj[key], objB[key], 'path');
      } else if (key === 'subPackages') {
        const commonPackageRoots = [];
        // 合并root
        for (const item of newObj[key]) {
          for (const bItem of objB[key]) {
            if (item.root === bItem.root) {
              commonPackageRoots.push(item.root);
              item.pages = unionBy(item.pages, bItem.pages, 'path');
              break;
            }
          }
        }

        const diffPackages = objB[key].filter(item => {
          return !commonPackageRoots.includes(item.root);
        });

        newObj[key] = newObj[key].concat(diffPackages);
      }
    } else if (
      key === 'easycom' &&
      newObj[key] &&
      newObj[key]['custom'] &&
      objB[key] &&
      objB[key]['custom']
    ) {
      newObj[key]['custom'] = { ...newObj[key]['custom'], ...objB[key]['custom'] };
    } else {
      newObj[key] = objB[key];
    }
  });
  return newObj;
}

function outputManifest(inFile, outFile, updateConfig, conf) {
  const data = fs.readFileSync(inFile);
  const value = data
    .toString()
    .replace(/\/\*{1,2}[\s\S]*?\*\//g, '') // 去除多行注释
    .replace(/\/\/\W.*(\r|\n)/g, ''); // 去除单行注释（仅'// *'后面带空格的才能匹配, 否则碰到url会误匹配）
  const jsonData = JSON.parse(value);

  // manifest需要动态传参
  updateConfig(jsonData, conf);
  fs.writeFileSync(outFile, JSON.stringify(jsonData));
}

function outputTheme(outFile, conf) {
  const value = [];
  value.push(`$ui-color-primary:${conf.uiColorPrimary};`);
  value.push(`$ui-color-page-primary:${conf.uiColorPagePrimary};`);
  fs.writeFileSync(outFile, value.join('\r\n'));
}

function outputPackage(inFile, conf) {
  const data = fs.readFileSync(inFile);
  const value = data
    .toString()
    .replace(/\/\*{1,2}[\s\S]*?\*\//g, '') // 去除多行注释
    .replace(/\/\/\W.*(\r|\n)/g, ''); // 去除单行注释（仅'// *'后面带空格的才能匹配, 否则碰到url会误匹配）
  const jsonData = JSON.parse(value);

  jsonData['version'] = conf.appVersion;
  fs.writeFileSync(inFile, JSON.stringify(jsonData));
}

/**
 * @param {syskind} kind
 * @param {undefined|Function} updateConfig 回调函数, 更新配置
 */
function outputEnvPagesManifestConf(answers, kind, updateConfig, changePackageVersion = false) {
  console.log('answers', answers);
  const appConfig = require(resolve(`bin/source/${answers.vitePackage}.json`));
  appConfig['target'] = appConfig.env[answers.viteServerEnv.toLowerCase()].impUrlNew;
  appConfig['wxAppId'] = appConfig.env[answers.viteServerEnv.toLowerCase()].wxAppId;
  if (answers.appVersion && answers.appVersion.length > 0) {
    appConfig.appVersion = answers.appVersion;
  }

  // 输出到.env
  outputEnv(answers, appConfig);

  // 输出pages.json
  let inFiles = [resolve(`bin/${kind}/pages-common-${kind}.json`)];
  answers.viteComposition.split('_').forEach(element => {
    inFiles.push(resolve(`bin/${kind}/pages-${element}-${kind}.json`));
  });

  // 输出到pages.json;
  outputPagesConf(inFiles, resolve('src/pages.json'));
  // 输出manifest.json;
  outputManifest(
    resolve(`bin/${kind}/manifest-${kind}.json`),
    resolve('src/manifest.json'),
    updateConfig,
    appConfig,
  );
  // 输出到css-theme.scss
  outputTheme(resolve('src/styles/theme/css-theme.scss'), appConfig);
  // 输出到package.json
  if (changePackageVersion) {
    outputPackage(resolve('package.json'), appConfig);
  }

  if (!['wx', 'app'].includes(kind)) {
    fs.readFile(path.join(__dirname, '../../', `/ci/docker/${kind}/Dockerfile`), (err, data) => {
      if (err) {
        console.log('文件不存在', err);
        return;
      }
      fs.writeFileSync(path.join(__dirname, '../../', '/ci/docker/Dockerfile'), data);
    });
  }
}

module.exports = {
  outputEnvPagesManifestConf,
};
