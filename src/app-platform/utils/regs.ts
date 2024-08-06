// 常用正则
export const REGS = {
  char_str: /^[\u4e00-\u9fa5_a-zA-Z]+$/, // 中文和英文
  notAllSpecialChar: /^(?!([^(0-9a-zA-Z\u4E00-\u9FA5\uF900-\uFA2D)])+$)/, // 不能全是特殊字符
  url: /^(https?:\/\/([a-zA-Z0-9-_]+\.)+([a-zA-Z0-9-_]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?$/, // http(s)开头的url
  allNumber: /^[\d]*$/, // 都是数字, 空字符串也算
  blankAndSpecialCharacter: /^(?!([^(0-9a-zA-Z\u4E00-\u9FA5\uF900-\uFA2D)])+$)/, // 非全空格和特殊字符
  halfAngle: /[\u0000-\u00ff]/, // 半角 (全角的正则不全面, 若要全角直接半角取反即可)
  userName: /^[a-zA-Z\u4e00-\u9fa5]{2,10}$/, // 只允许输入2-10位中英文字符
  numberAndChar: /^[a-zA-Z0-9]*$/, // 数字+英文
  numberAndCharV1: /^[\u4e00-\u9fa5a-zA-Z0-9]*$/, // 数字+英文+中文
  noEmoji:
    /^[\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201F\u2026\u2022\u20AC]+$/, // emoji 表情符号
  /** 是否小数, len为小数的位数 */
  isDigital: (len = 1) => new RegExp(`^[+-]\?\\d*(.\\d\{1,${len}})?$`),
  isNumber: /^[0-9]*$/, // 纯数字
};

/** 密码安全等级校验 */
export const regExpVerifyPassword = /^[0-9a-zA-Z!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;
