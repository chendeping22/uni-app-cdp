const DataTypeEnum = {
  Int_8: 'Int8',
  UINT_8: 'Uint8',
  INT_16: 'Int16',
  UINT_16: 'Uint16',
  INT_32: 'Int32',
  UINT_32: 'Uint32',
  FLOAT_32: 'Float32',
  FLOAT_64: 'Float64',
};

/**
 * 在data中的offset位置写入
 * @param {DataView} data    二进制数据
 * @param {Number}      offset  偏移量
 * @param {boolean} littleEdian     是否是小端字节序
 * @param {String}      str     字符串
 */
const write = (data, offset, value, type, littleEdian) => {
  data[`set${type}`](offset, value, littleEdian);
};

/**
 * 在data中的offset位置开始写入str字符串
 * @param {DataView} data    二进制数据
 * @param {Number}      offset  偏移量
 * @param {String}      str     字符串
 */
const writeString = (data, offset, str) => {
  for (let i = 0; i < str.length; i++) {
    write(data, offset + i, str.charCodeAt(i), DataTypeEnum.UINT_8);
  }
};

/**
 * 转换到我们需要的对应格式的编码
 *
 * @param {float32array} bytes      pcm二进制数据
 * @param {number}  sampleBits      采样位数
 * @param {boolean} littleEdian     是否是小端字节序
 * @returns {dataview}              pcm二进制数据
 */
const encodePCM = (bytes, sampleBits, littleEdian = true) => {
  let offset = 0,
    dataLength = bytes.length,
    // dataLength = bytes.length * (sampleBits / 8),
    buffer = new ArrayBuffer(dataLength),
    data = new DataView(buffer);

  // 写入采样数据
  if (sampleBits === 8) {
    for (let i = 0; i < bytes.length; i++, offset++) {
      // 范围[-1, 1]
      const s = Math.max(-1, Math.min(1, bytes[i]));
      // 8位采样位划分成2^8=256份，它的范围是0-255;
      // 对于8位的话，负数*128，正数*127，然后整体向上平移128(+128)，即可得到[0,255]范围的数据。
      let val = s < 0 ? s * 128 : s * 127;
      val = +val + 128;

      bytes.forEach((item, index) => {
        const s = Math.max(-1, Math.min(1, item));
        write(data, index, val, DataTypeEnum.INT_8, false);
      });
    }
  } else {
    bytes.forEach((item, index) => {
      const s = Math.max(-1, Math.min(1, item));

      // 压缩数据,以后需要提取出来
      if (index % 2 === 0) {
        write(data, index, s < 0 ? s * 0x8000 : s * 0x7fff, DataTypeEnum.INT_16, littleEdian);
      }

      // write(data, index * 2, s < 0 ? s * 0x8000 : s * 0x7fff, DataTypeEnum.INT_16, littleEdian);
    });
  }

  return data;
};

/**
 * 转换为生态需要的udp格式
 * 所以，此处只需要在pcm数据前增加下就行了。
 *
 * @param {DataView} bytes           pcm二进制数据
 * @param {number} taskCode        接口返回的ultaskCode
 * @param {number}  inputSampleRate  输入采样率
 * @param {number}  outputSampleRate 输出采样率
 * @param {number}  numChannels      声道数
 * @param {number}  oututSampleBits  输出采样位数
 * @param {boolean} littleEdian      是否是小端字节序
 * @returns {DataView}               二进制数据
 */
const encodeUdp = (bytes, taskCode = 999, numChannels = 1) => {
  const bytesLength = bytes.byteLength;

  // let sampleRate = outputSampleRate > inputSampleRate ? inputSampleRate : outputSampleRate,   // 输出采样率较大时，仍使用输入的值，
  //     sampleBits = oututSampleBits,

  let buffer = new ArrayBuffer(8 + bytesLength),
    data = new DataView(buffer),
    channelCount = numChannels, // 声道
    offset = 0;

  // 写入文件长度，2个字节
  write(data, offset, bytesLength + 8, DataTypeEnum.INT_16, true);
  offset += 2;
  // 写入taskCode，4个字节
  write(data, offset, taskCode, DataTypeEnum.INT_32, true);
  offset += 4;
  // 写入serverId,2个字节
  write(data, offset, 999, DataTypeEnum.INT_16, true);
  offset += 2;

  // 增加musicbuff
  for (let i = 0; i < bytes.byteLength; ) {
    data.setInt16(offset, bytes.getInt16(i));
    // write(data, offset, bytes.getInt16(i), DataTypeEnum.INT_16);
    offset += 2;
    i += 2;
  }

  return data;
};

const DataViewToBase64 = (bytes, callback) => {
  const udpBlob = new Blob([bytes]);
  const fileReader = new FileReader();
  fileReader.onload = e => {
    callback(e.target.result);
  };
  fileReader.readAsDataURL(udpBlob);
};

const transformToArrayBuffer = base64String => {
  // const test='data:application/octet-stream;base64,CAAAAAPnA+c='

  // fetch(test)
  // .then(r => r.blob())
  // .then(b =>b.arrayBuffer())
  // .then(buff => console.log(buff, new ArrayBuffer(buff) /* just for a view purpose */ ))
  // .catch(e => console.log(e));

  const url = base64String.substring(base64String.indexOf(',') + 1);

  const padding = '='.repeat((4 - (url.length % 4)) % 4);
  const base64 = (url + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Int8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  console.log('outputArray', outputArray);
  return outputArray;
};

export default {
  DataViewToBase64,
  encodePCM,
  encodeUdp,
};
