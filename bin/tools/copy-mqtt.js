const { resolve, copyFile } = require('./util');

module.exports = () => {
  copyFile(resolve('bin/mqtt/mqtt.js'), resolve('node_modules/mqtt/dist/mqtt.js'));
  copyFile(resolve('bin/mqtt/mqtt.min.js'), resolve('node_modules/mqtt/dist/mqtt.min.js'));
};
