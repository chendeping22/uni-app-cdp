const { resolve, copyFolder } = require('./util');

const getUnPackageDir = () => {
  const path = process.cwd();
  const s = path.split('\\');
  s.splice(s.length - 1, 1, 'unpackage');
  return s.join('\\');
};

copyFolder(getUnPackageDir(), resolve('dist/dev/app/'));
