const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

/** 小驼峰转中划线 */
function transCamel(_str, symbol) {
  const str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, $1 => `${symbol}${$1.toLowerCase()}`);
}

/** 生成当前文件路径 */
function resolve(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

/** 执行cmd命令 貌似还有问题，执行不成功， 另外看下vite doc有没有手动启动vite */
function cmdSync(cmd, throwError = false) {
  try {
    return child_process.execSync(cmd).toString();
  } catch (error) {
    if (throwError) console.error(error);
  }
}

/** 替换文件内容 */
function copyAndModifyFile(srcPath, tarPath, oldStr, newStr) {
  const content = fs.readFileSync(srcPath, { encoding: 'utf-8' });
  const newContent = content.replace(oldStr, newStr);
  fs.writeFileSync(tarPath, newContent, { encoding: 'utf-8' });
}

/** 复制文件 */
function copyFile(srcPath, tarPath, cb) {
  var rs = fs.createReadStream(srcPath);
  rs.on('error', function (err) {
    if (err) {
      console.log('read error', srcPath);
    }
    cb && cb(err);
  });

  var ws = fs.createWriteStream(tarPath);
  ws.on('error', function (err) {
    if (err) {
      console.log('write error', tarPath);
    }
    cb && cb(err);
  });
  ws.on('close', function (ex) {
    cb && cb(ex);
  });
  rs.pipe(ws);
}

/** 复制文件夹下所有文件或子目录(不包含本身) */
function copyFolderChildren(srcDir, tarDir, cb) {
  fs.readdir(srcDir, function (err, files) {
    var count = 0;
    var checkEnd = function () {
      ++count == files.length && cb && cb();
    };

    if (err) {
      checkEnd();
      return;
    }
    files.forEach(function (file) {
      var srcPath = path.join(srcDir, file);
      var tarPath = path.join(tarDir, file);

      fs.stat(srcPath, function (err, stats) {
        if (stats.isDirectory()) {
          fs.mkdir(tarPath, function (err) {
            if (err) {
              console.log(err);
              return;
            }
            copyFolderChildren(srcPath, tarPath, checkEnd);
          });
        } else {
          copyFile(srcPath, tarPath, checkEnd);
        }
      });
    });

    //为空时直接回调
    files.length === 0 && cb && cb();
  });
}

function getFiles(srcDir) {
  fs.readdir(srcDir, function (err, files) {
    console.log(
      'TCL: getFiles -> files',
      files.map(f => '"' + f.replace('.svg', '') + '"').join(','),
    );
    if (err) {
      console.log('TCL: getFiles -> err', err);
      return;
    }
  });
}

/** 复制文件夹下所有文件或子目录 */
function copyFolder(from, to, cb) {
  // 先在目标文件夹中创建目录
  const s = from.split('\\');
  const folderName = s[s.length - 1];
  const to2 = to + '/' + folderName;
  if (!fs.existsSync(to2)) {
    fs.mkdirSync(to2);
  }
  // 拷贝from中的子目录或文件
  copyFolderChildren(from, to2, cb);
}

module.exports = {
  transCamel,
  copyAndModifyFile,
  copyFile,
  copyFolder,
  resolve,
  cmdSync,
  getFiles,
};
