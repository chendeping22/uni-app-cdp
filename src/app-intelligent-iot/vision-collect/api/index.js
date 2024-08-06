const files = import.meta.globEager('./modules/*.js');
const moduleApi = {};

Object.keys(files).forEach(fileName => {
  const name = fileName.replace(/\.\/\modules\/|\.js/g, '');
  moduleApi[name] = files[fileName].default;
});

export default {
  ...moduleApi,
};
