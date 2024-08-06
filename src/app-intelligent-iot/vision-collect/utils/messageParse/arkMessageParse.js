/**
 * 设备报文解析
 */

import Hex2Float from './hex2float.js';

/**
 * 巨目验光仪报文解析
 * struct strWifiData 
    {
        char   	sta;//起始位
        char   	Head[8];//头
        float 	RAverSCA[3];		//每次测量显示的右眼SCA平均值  S C A 
        float 	LAverSCA[3];		//每次测量显示的左眼SCA平均值  S C A
        float 	RAverKER[4];		//每次测量显示的右眼KER平均值  R1,R2,AX BX
        float 	LAverKER[4];		//每次测量显示的左眼KER平均值  R1,R2,AX BX
        float	PD;				//瞳距 
        float	SE[2];			//0-R,1-L;
        float   RAverKERD[3];		//D1 D2 D_AVER
        float   LAverKERD[3];		//D1 D2 D_AVER
        float   Cyl[2];			//0-R,1-L;
        float   Pup[2];			//0-R,1-L;  左右眼瞳孔直径
        char	Re2seve[8]; 
        char    crc;
        char    end;
    };//共79+48个字节
 * 1、接受到数据为十进制，先转十六进制
 * 2、从第10个字节开始每四个字节转换成一个浮点数
 * 3、获取的浮点数为单精度，低位在前高位在后
 * 4、组合输出
 * @return {Object}
 */
export const ArkMessageParse = (dataArr = []) => {
  // 去除头尾无用数据，转16进制
  const hexArr = dataArr.slice(9, dataArr.length - 10).map((item) => {
    const hex = item.toString(16);
    if (hex.length < 2) return '0' + hex;
    return hex;
  });
  // 每4个数组项组合，按小端模式（低位在前、高位在后）进行反转，组合成十六进制字符串
  const hexStrArr = [];
  for (let i = 0; i < hexArr.length; i += 4) {
    hexStrArr.push(
      hexArr
        .slice(i, i + 4)
        .reverse()
        .join('')
    );
  }
  const floatStrArr = hexStrArr.map((item) =>
    parseFloat(Hex2Float.HexToSingle(item)).toFixed(2)
  );
  return floatStrArr;
};

export default ArkMessageParse;

// 巨目验光仪测试数据（设备直接上报数据）
// const a = [
//   2, 119, 105, 102, 105, 0, 0, 0, 0, 0, 0, 96, 192, 0, 0, 128, 191, 0, 0, 100,
//   66, 0, 0, 96, 192, 0, 0, 128, 190, 0, 0, 6, 67, 0, 0, 0, 65, 154, 153, 249,
//   64, 0, 0, 52, 66, 0, 0, 7, 67, 0, 0, 0, 65, 72, 225, 242, 64, 0, 0, 7, 67, 0,
//   0, 52, 66, 116, 50, 136, 66, 0, 0, 128, 192, 0, 0, 112, 192, 205, 204, 40, 66,
//   0, 0, 45, 66, 102, 230, 42, 66, 205, 204, 40, 66, 205, 204, 49, 66, 205, 76,
//   45, 66, 96, 102, 134, 191, 0, 0, 16, 192, 123, 20, 94, 64, 123, 20, 142, 64,
//   0, 0, 0, 0, 0, 0, 0, 0, 139, 3,
// ];
// ArkMessageParse(a);
