/**
 * 单精度浮点数的长度字节，其中最高位为符号位S，中间8位表示阶码e，低23位表示尾数f。
 * 单精度浮点数表示法规定：把一个数转换成浮点数储存时，整数部分保持位“1”，但这个“1”不存储，是隐含的。因此把一个单精度浮点数转换成真值时，需要在尾数的整数部分加一个“1”。
 * 例如：13=1101B，将其规格化成浮点数后的结果位1.101×211，其整数部分的“1”不存储。尾数中只存储存小数部分的“101”。阶码部分为纯整数，并用移码表示。在使用单精度浮点数格式表示时，阶码的偏移值为127（即1111111B）。所以采用单精度浮点数表示时，数的真值为（-1）S2e-127×（1.f） [1]
 */
export class Hex2Float {
  static FillString(t, c, n, b) {
    if (t == '' || c.length != 1 || n <= t.length) {
      return t;
    }
    var l = t.length;
    for (var i = 0; i < n - l; i++) {
      if (b == true) {
        t = c + t;
      } else {
        t += c;
      }
    }
    return t;
  }
  static HexToSingle(t) {
    t = t.replace(/\s+/g, '');
    if (t == '') {
      return 0;
    }
    if (t == '00000000') {
      return 0;
    }
    if (t.length > 8 || isNaN(parseInt(t, 16))) {
      return 'Error';
    }
    if (t.length < 8) {
      t = Hex2Float.FillString(t, '0', 8, true);
    }
    t = parseInt(t, 16).toString(2);
    t = Hex2Float.FillString(t, '0', 32, true);
    // 符号位
    var s = t.substring(0, 1);
    // 阶码
    var e = t.substring(1, 9);
    // 尾数 f
    var m = t.substring(9);
    e = parseInt(e, 2) - 127;
    // 转为真值要加"1"
    m = '1' + m;
    if (e >= 0) {
      m = m.substr(0, e + 1) + '.' + m.substring(e + 1);
    } else {
      m = '0.' + Hex2Float.FillString(m, '0', m.length - e - 1, true);
    }
    if (m.indexOf('.') == -1) {
      m = m + '.0';
    }
    var a = m.split('.'); // [整数，小数]
    var mi = parseInt(a[0], 2);
    var mf = 0;
    for (var i = 0; i < a[1].length; i++) {
      mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1));
    }
    m = parseInt(mi) + parseFloat(mf);
    if (s == 1) {
      m = 0 - m;
    }
    return m;
  }
}
export default Hex2Float;
