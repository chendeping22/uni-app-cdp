import JCAPI from './JCAPI/JCAPI';

export function usePrint() {
  /**
   * 开始打印任务
   * @param {number} gapType - 纸张类型 1.间隙纸  2.黑标纸  3.连续纸  4.定孔纸  5.透明纸  6.标牌
   * @param {number} darkness - 打印浓度B3S/B1/B203/B21/K3/K3W/M2 浓度范围1-5 建议3  B32/Z401 浓度范围1-15 建议8
   * @param {number} totalCount - 总打印份数，表示所有页面的打印份数之和。例如，如果你有3页需要打印，第一页打印3份，第二页打印2份，第三页打印5份，那么count的值应为10（3+2+5）。
   * @param {function} callback - 任务开启后的回调函数
   */
  function startJob(gapType, darkness, totalCount, callback) {
    JCAPI.startJob(gapType, darkness, totalCount, callback);
  }

  /**
   * 打印前开始绘制
   * @param {string} canvasId - 画布ID
   * @param {object} compent - 画布所在js对象
   * @param {number} labelWidth - 标签画布宽（标签宽度，单位mm）
   * @param {number} labelHeight - 标签画布高（标签高度，单位mm）
   * @param {number} roration - 旋转角度，默认为0，支持0/90/180/270
   * @description
   * 对应的canvas宽高建议使用变量
   */
  function startDrawLabel(canvasId, compent, labelWidth, labelHeight, roration = 0) {
    JCAPI.startDrawLabel(canvasId, compent, labelWidth, labelHeight, roration);
  }

  /**
   * 绘制文本
   * @param {string} content - 文本内容
   * @param {number} x - 起点x，单位mm
   * @param {number} y - 起点y，单位mm（左下角坐标）
   * @param {number} fontHeight - 字体大小，单位mm
   * @param {number} rotation - 旋转角度，默认为0，支持0/90/180/270，旋转中心点左下角
   * @param {object} options - 选项，如下：
   *                         {
   *                           bold: false,       // 是否加粗
   *                           italic: false,     // 是否倾斜
   *                           family: 'SimHei', // 字体设置
   *                           align: 'left'/'right'/'center' // 对齐方式
   *                         }
   * @description
   * 注意事项：
   * 1. IOS斜体不支持中文，字体自定义不支持中文，仅支持小程序内置字体。
   * 2. 0°对齐方式中心点为X坐标，即左对齐时文本左下角坐标为x，右对齐时文本右下角坐标为x，居中对齐时文本底部中心点坐标为x。
   * 3. 90°对齐方式中心点为旋转后的Y坐标，即左对齐时文本左下角坐标为旋转后的Y坐标，右对齐时文本右下角坐标为旋转后的Y坐标，居中对齐时文本底部中心点坐标为旋转后的Y坐标。
   * 4.180°和270°类似，可自行尝试
   */
  function drawText(content, x, y, fontHeight, rotation = 0, options = null) {
    JCAPI.drawText(content, x, y, fontHeight, rotation, options);
  }

  /**
   * 绘制条码
   * @param {string} content - 条码内容
   * @param {number} x - 起点x,单位mm
   * @param {number} y - 起点y,单位mm
   * @param {number} width - 宽,单位mm
   * @param {number} height - 高,单位mm
   * @param {number} rotation - 旋转角度，默认为0，支持0/90/180/270，旋转中心点左上角
   * @param {number} fontSize - 文本的字体大小,单位mm
   * @param {number} fontHeight - 文本的高度,单位mm
   * @param {number} postion - 文本位置，0-条码下方 1-条码上方 2-不显示文体，此时fontSize/fontHeight无效
   */
  function drawBarcode(
    content,
    x,
    y,
    width,
    height,
    rotation = 0,
    fontSize,
    fontHeight,
    postion = 2,
  ) {
    JCAPI.drawBarcode(content, x, y, width, height, rotation, fontSize, fontHeight, postion);
  }

  /**
   * 绘制二维码
   * @param {string} content - 二维码内容
   * @param {number} x - 起点x,单位mm
   * @param {number} y - 起点y,单位mm（左上角坐标）
   * @param {number} width - 宽,单位mm
   * @param {number} height - 高,单位mm
   * @param {number} rotation - 旋转角度，默认为0，支持0/90/180/270，旋转中心点左上角
   * @param {number} ecc - 纠错等级 0-3
   */
  function drawQRCode(content, x, y, width, height, rotation = 0, ecc = 2) {
    JCAPI.drawQRCode(content, x, y, width, height, rotation, ecc);
  }

  /**
   * 绘制矩形
   * @param {number} x - 起点x,单位mm
   * @param {number} y - 起点y,单位mm
   * @param {number} width - 宽,单位mm
   * @param {number} height - 高,单位mm
   * @param {number} lineWidth - 线条宽,单位mm
   * @param {boolean} isFilled - 是否填充
   * @param {number} rotation - 旋转角度，默认为0，支持0/90/180/270，旋转中心点左上角
   */
  function drawRectangle(x, y, width, height, lineWidth, isFilled = false, rotation = 0) {
    JCAPI.drawRectangle(x, y, width, height, lineWidth, isFilled, rotation);
  }

  /**
   * 绘制线条
   * @param {number} x - 起点x，单位mm
   * @param {number} y - 起点y，单位mm（左下角坐标）
   * @param {number} width - 宽度，单位mm
   * @param {number} height - 高度，单位mm
   * @param {number} rotation - 旋转角度，默认为0，支持0/90/180/270，旋转中心点左上角
   *
   * @description
   * 计算线条的左上角为y坐标+线高
   */
  function drawLine(x, y, width, height, rotation = 0) {
    JCAPI.drawLine(x, y, width, height, rotation);
  }

  /**
   * 绘制图片
   * @param {string} path - 本地图片路径（暂不支持网络图片）
   * @param {number} x 起点x,单位mm
   * @param {number} y 起点y,单位mm
   * @param {number} width 宽,单位mm
   * @param {number} height 高,单位mm
   * @param {number} rotation - 旋转角度，默认为0，支持0/90/180/270，旋转中心点左上角
   *
   * @description
   * 暂不支持网络图片，需要将图片缓存到本地后，传入本地路径进行绘制
   * 图像背景不可以设置为透明色，否则会打印出黑块
   */
  function drawImage(path, x, y, width, height, rotation = 0) {
    JCAPI.drawImage(path, x, y, width, height, rotation);
  }

  /**
   * 结束绘制标签
   * @param {function} callback - 绘制完之后的回调
   */
  function endDrawLabel(callback) {
    JCAPI.endDrawLabel(callback);
  }

  /**
   * 启动打印操作。
   *
   * @param {number} onePageCount - 一页中的打印份数，默认为 1。
   * @param {Function} callback - 回调,表示可以发送下一页数据，不表示已打印完成，打印完成与否监听页码变化状态
   * @param {Object|null} optionPara - 可选参数，用于配置打印选项。默认为 null。
   */
  function startPrint(onePageCount = 1, callback, optionPara = null) {
    JCAPI.print(onePageCount, callback, optionPara);
  }

  /**
   * 读取打印进度信息并触发回调函数
   *
   * @param {Function} callback - 回调函数，用于接收页码数据的对象：{'count': int（必需）， 'tid': string（非必需）}。
   */
  function didReadPrintCountInfo(callback) {
    JCAPI.didReadPrintCountInfo(callback);
  }

  /**
   * 读取打印错误信息并触发回调函数。
   *
   * @param {Function} callback - 回调函数，用于接收打印错误信息的数据。
   */
  function didReadPrintErrorInfo(callback) {
    JCAPI.didReadPrintErrorInfo(callback);
  }

  /**
   * 打印机搜索相关方法
   * @param {*} callback 搜索回调
   */
  function scanedPrinters(callback) {
    JCAPI.scanedPrinters(callback);
  }

  /**
   * 打印机连接
   * @param {*} name 当前连接打印机名称
   * @param {*} successConnect 成功回调
   * @param {*} failConnect 失败回调
   */
  function openPrinter(name, successConnect, failConnect) {
    JCAPI.openPrinter(name, successConnect, failConnect);
  }

  // 获取当前连接打印机名称
  function getConnName() {
    return JCAPI.getConnName();
  }

  // 打印机断开连接
  function closePrinter() {
    JCAPI.closePrinter();
  }

  // 取消打印
  function cancelPrint() {
    JCAPI.cancelPrint();
  }

  return {
    scanedPrinters,
    getConnName,
    openPrinter,
    closePrinter,
    cancelPrint,
    startJob,
    startDrawLabel,
    drawText,
    drawBarcode,
    drawQRCode,
    drawRectangle,
    drawLine,
    drawImage,
    endDrawLabel,
    startPrint,
    didReadPrintCountInfo,
    didReadPrintErrorInfo,
  };
}
