export const supportDevice = ['Z401'];

export const ERROR_MSG_MAP = {
  1: '异常开盖，请关闭上盖后再继续打印',
  2: '未检测到标签纸，请重新安装后再试',
  3: '电量过低，请充电后再试',
  4: '电池异常，请联系客服',
  5: '已停止打印',
  6: '打印异常，请稍后再试',
  7: '打印头温度过高，请冷却后再试',
  8: '出纸异常或标签纸用完，请检查标签纸后再试',
  9: '打印忙碌，请稍后再试',
  10: '未检测到打印头，请联系客服',
  11: '打印环境温度过低，请在室温下再试',
  12: '打印头未锁紧，请锁紧后再试',
  13: '未检测到碳带，请安装碳带后再试',
  14: '碳带不匹配，请安装匹配类型碳带',
  15: '碳带已用完，请更换碳带后再试',
  16: '纸张类型错误，请联系客服',
  17: '纸张类型设置失败，请重新设置',
  18: '打印模式异常，请重新设置',
  19: '浓度设置异常，请重新设置',
  20: '标签损坏或非RFID标签，请检查标签纸后再试',
  21: '边距设置失败',
  22: '通讯异常，请稍后再试',
  23: '打印机连接断开，请重新连接再试',
  24: '画板参数错误',
  25: '旋转⻆度错误',
  26: 'json参数错误',
  27: '出纸异常或标签纸用完，请检查标签纸后再试',
  28: '纸张类型错误，请联系客服',
  29: 'RFID标签未进⾏写⼊操作，请检查标签纸后再试',
  30: '浓度设置异常，请重新设置',
  31: '打印模式异常，请重新设置',
};
export const ERROR_MSG_MAP_WX = {
  65280: '打印超时，请重新连接再试',
  65281: '打印机连接断开，请重新连接再试',
  65282: '打印异常，请稍后再试',
  65283: '打印忙碌，请稍后再试',
  65284: '画布获取数据错误，请稍后再试',
  65285: '纸张类型设置失败，请重新设置',
  65286: '查询打印纸张状态异常，请稍后再试',
  65287: '异常开盖，请关闭上盖后再继续打印',
  65288: '未检测到标签纸，请重新安装后再试',
  65289: '电量过低，请充电后再试',
  65290: '电池异常，请联系客服',
  65291: '已停止打印',
  65292: '打印异常，请稍后再试',
  65293: '打印头温度过高，请冷却后再试',
  65294: '出纸异常或标签纸用完，请检查标签纸后再试',
  65295: '纸张类型错误，请联系客服',
  65296: 'RFID标签未进⾏写⼊操作，请检查标签纸后再试',
  65297: '出纸异常或标签纸用完，请检查标签纸后再试',
  65298: '发送epc指令但未检测到RFID标签，请检查标签纸后再试',
  65299: '检测到RFID标签但未发送EPC指令，请检查标签纸后再试',
  65300: '未检测到碳带，请安装碳带后再试',
  65301: '打印头未锁紧，请锁紧后再试',
  65302: '碳带已用完，请更换碳带后再试',
  65303: '碳带不匹配，请安装匹配类型碳带',
  65025: 'epc格式不对，请检查标签纸后再试',
  65024: '绘制元素超时错误，请稍后再试',
};

/**
 * 字符串显示行数
 *
 * @param dish 菜品名称
 * @param maxWordDisplay 单行最多可以显示的字数
 * @returns {number} 菜品显示的行数
 */
export function getShowLines(content, maxWordDisplay) {
  let showLines = 1;
  const contentLength = content.length;
  if (contentLength > maxWordDisplay) {
    console.log(contentLength / maxWordDisplay);
    showLines =
      contentLength % maxWordDisplay === 0
        ? contentLength / maxWordDisplay
        : Math.ceil(contentLength / maxWordDisplay);
  }

  return showLines;
}

/**
 * 获取指定行的显示文本
 *
 * @param {string} dishName - 原字符串内容
 * @param {number} lineIndex - 行索引
 * @param {number} lines - 总行数
 * @param {number} maxWordDisplay - 每行最大显示字节数
 * @return {string} 返回指定行的显示文本
 */
export function getDisplayTextForLine(content, lineIndex, lines, maxWordDisplay) {
  let text;
  if (lines === 1) {
    text = content;
  } else if (lineIndex !== lines - 1 || content.length % maxWordDisplay === 0) {
    text = content.substring(lineIndex * maxWordDisplay, (lineIndex + 1) * maxWordDisplay);
  } else {
    text = content.substring(lineIndex * maxWordDisplay);
  }

  return text;
}

export const mmToPX = (mm: number) => {
  return Math.floor((mm / 25.4) * 96);
};

/**
 * 获取当行最多展示的字数
 *
 * @param context 上下文对象
 * @param maxWidth 最大展示宽度
 * @param fontSize 字号，有可能不同区域字号不一样
 * @returns {number|number} 单行可展示的最多字数
 */
export function getMaxWordDisplayForSingleLine(canvasCtx, maxWidth, fontSize) {
  let word = '立';
  canvasCtx.font = `${fontSize}px sans-serif`;
  let contentTextMetrics = canvasCtx.measureText(word);
  let contentTextWidth = contentTextMetrics.width;
  while (contentTextWidth < maxWidth) {
    word += '立';
    console.log(word);
    contentTextMetrics = canvasCtx.measureText(word);
    contentTextWidth = contentTextMetrics.width;
    console.log(`最大宽度为:${maxWidth},文字宽度为:${contentTextWidth}`);
  }

  return word.length === 1 ? 1 : word.length - 1;
}

/**
 * 获取本行可容下的文本数量
 *
 * @param content 字符串内容
 * @param maxWidth 最大展示宽度
 * @param fontSize 字号，有可能不同区域字号不一样
 * @returns 本行可容下的文本
 */
export function getMaxWordForLine(canvasCtx, content, maxWidth, fontSize) {
  if (content === '' || content === null || content === undefined) {
    return '';
  }
  let word = '';
  canvasCtx.font = `${fontSize}px Arial`;
  let contentTextMetrics;
  let contentTextWidth;
  for (let i = 0; i < maxWidth; i++) {
    word += content[i] || '';
    contentTextMetrics = canvasCtx.measureText(word);
    contentTextWidth = contentTextMetrics.width;

    if (contentTextWidth >= maxWidth || i > content?.length) {
      return i;
    }
  }

  return content.length;
}

/**
 * 转成带换行符的内容
 * @param canvasCtx
 * @param content
 * @param maxWidth
 * @param fontSize
 * @returns {string}
 */
export function convertTextWithWrap(canvasCtx, content, maxWidth, fontSize) {
  // let showLines = 2;
  // if (maxRow) {
  //   showLines = maxRow;
  // }
  let contentNew = '';
  // let index = 0;
  while (content) {
    const maxWord = getMaxWordForLine(canvasCtx, content, mmToPX(maxWidth), mmToPX(fontSize));
    contentNew += `${content.substring(0, maxWord)}\n`;
    content = content.substring(maxWord);
    // index++;
    // if (index >= showLines) {
    //   break;
    // }
  }

  return contentNew;
}

export function convertContent(canvasCtx, values, maxWidth, maxHeight, fontSize, spacing = 0.8) {
  let _text;
  let _fontSize;
  let lines;
  let maxLen;

  while (!lines || (lines > maxLen && _fontSize > 1.8)) {
    _fontSize = _fontSize ? Math.floor((_fontSize - 0.3) * 10) / 10 : fontSize;
    maxLen = Math.floor(maxHeight / (_fontSize + spacing));

    _text = values.reduce((_content, current) => {
      return _content + convertTextWithWrap(canvasCtx, current, maxWidth, _fontSize);
    }, '');

    lines = _text.split('\n').length - 1;
  }

  let _values = _text.split('\n').filter(Boolean);

  if (lines > maxLen) {
    _values = _values.slice(0, maxLen);
  }

  let top = (maxHeight - _values.length * (_fontSize + spacing)) / 2;
  top = top > 0 ? Math.floor(top * 100) / 100 : 0;

  console.log({ _values, _text, fontSize: _fontSize, top, maxLen });
  return { values: _values, fontSize: _fontSize, top };
}
