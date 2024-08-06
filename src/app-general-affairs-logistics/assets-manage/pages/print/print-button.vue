<template>
  <view class="toolbar">
    <u-button type="primary" :disabled="disabled" style="flex: 1" @click="printLabel()">
      打印
    </u-button>
    <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
  </view>
  <PrintProgressModal
    ref="PrintProgressModalRef"
    :is-stop="isStop"
    :total="list.length"
    :printed-count="printedCount"
    :print-error="printError"
    @handle-print="handlePrint"
    @cancel="handleCancelPrint"
  ></PrintProgressModal>
  <view class="canvas-wrap">
    <canvas
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      canvas-id="assetLabelCanvas"
    ></canvas>
  </view>
</template>

<script>
import { usePrint } from '../../hooks/print/usePrint';
import { ERROR_MSG_MAP_WX, convertContent, convertTextWithWrap } from '../../hooks/print/utils';
import PrintProgressModal from './print-progress-modal.vue';

const {
  startJob,
  startDrawLabel,
  drawText,
  drawQRCode,
  endDrawLabel,
  startPrint,
  didReadPrintCountInfo,
  didReadPrintErrorInfo,
  cancelPrint,
} = usePrint();

export default {
  components: {
    PrintProgressModal,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    isLinked: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => [],
    },
    template: {
      type: Object,
      default: () => ({}),
    },
    darkness: {
      type: Number,
      default: 12,
    },
    resetPrintData: {
      type: Function,
      default: () => {},
    },
    setPrintDevice: {
      type: Function,
      default: () => {},
    },
    checkConnected: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      canvasWidth: 200,
      canvasHeight: 200,
      printedCount: 0,
      printError: '',
      isStop: false,
      stopFinishCount: 0,
      printQueue: [],
      sendedIndex: 0,
    };
  },
  mounted() {
    this.createPrintQueue();
  },
  methods: {
    async handlePrint() {
      if (this.isStop) {
        const res = await this.checkConnected();
        console.log('file: print-button.vue:99 ~ handlePrint ~ res:', res);
        this.sendedIndex = this.printedCount;
        this.isStop = false;
        // res 有值说明重连了
        this.startPrintJob(!!res);
        if (res && this.printError) {
          this.printError = '';
        }
      } else {
        this.isStop = true;
        // cancelPrint();
      }
    },
    handleCancelPrint() {
      cancelPrint();
      uni.navigateBack();
    },
    async start() {
      while (this.sendedIndex < this.printQueue.length && !this.isStop) {
        const _task = this.printQueue[this.sendedIndex]; // this.printQueue.splice(0, 1)[0];
        await _task();
        this.sendedIndex = this.sendedIndex + 1;
      }
    },
    startPrintJob(isMonitor) {
      if (!this.printQueue.length) {
        return;
      }

      if (isMonitor) {
        didReadPrintCountInfo(res => {
          // this.printedCount = this.stopFinishCount + res.count;
          this.printedCount = this.printedCount + 1;
          console.log('打印进度 count：，已发送的条数', res, this.printedCount);
          if (this.printedCount === this.list.length) {
            // 清空选中的
            this.resetPrintData();
            uni.hideLoading();
            uni.showToast({
              title: `共${this.list.length}个资产二维码已打印完成`,
              icon: 'none',
              mask: true,
              duration: 1500,
            });
            this.$refs.PrintProgressModalRef.close();

            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          } else if (this.isStop) {
            // 暂停打印时，在打完下一个再执行暂停
            cancelPrint();
          }
        });

        didReadPrintErrorInfo(res => {
          if (res.errCode == 65281) {
            // 打印机断开连接
            this.setPrintDevice();
            // this.isStop = true;
            // cancelPrint();
          }
          console.log('打印出错 errCode: ', res);
          this.printError =
            res.msg ||
            ERROR_MSG_MAP_WX[res.errCode] ||
            (this.isLinked ? '打印失败, 请检查打印机' : '已断开，请重新连接');
          // 打印出错 暂停打印
          this.isStop = true;
          cancelPrint();
        });
      }

      /**
       * 开始打印任务
       * @param {number} gapType - 纸张类型 1.间隙纸  2.黑标纸  3.连续纸  4.定孔纸  5.透明纸  6.标牌
       * @param {number} darkness - 打印浓度B3S/B1/B203/B21/K3/K3W/M2 浓度范围1-5 建议3  B32/Z401 浓度范围1-15 建议8
       * @param {number} totalCount - 总打印份数，表示所有页面的打印份数之和。例如，如果你有3页需要打印，第一页打印3份，第二页打印2份，第三页打印5份，那么count的值应为10（3+2+5）。
       * @param {function} callback - 任务开启后的回调函数
       */
      startJob(1, this.darkness, this.printQueue.length - this.printedCount, () => {
        this.start();
      });
    },
    async printLabel() {
      this.$refs.PrintProgressModalRef.open();

      this.startPrintJob(true);
    },

    async createPrintQueue() {
      //标签尺寸
      const labelWidth = this.template.width || 50;
      const labelHeight = this.template.height || 20;
      //B3S/B1/B21/B203/K3/K3W的multiple传8，B32/Z401/M2的multiple传11.81
      const multiple = 11.81;
      this.canvasWidth = labelWidth * multiple;
      this.canvasHeight = labelHeight * multiple;

      const canvasCtx = uni.createCanvasContext('assetLabelCanvas', this);

      this.printQueue = this.list.map(item => {
        return () =>
          new Promise(resolve => {
            this.printError = '';

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
            startDrawLabel('assetLabelCanvas', this, labelWidth, labelHeight, 0);

            this.template.items?.map(param => {
              if (param.type === 'qrCode') {
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
                const assetInfoQRCodeVO =
                  item[param.fields?.[0]?.fieldName || 'assetInfoQRCodeVO'] || {};
                drawQRCode(
                  JSON.stringify(assetInfoQRCodeVO),
                  param.x,
                  param.y,
                  param.width,
                  param.height,
                  0,
                  2,
                );

                if (param.fields?.[0]?.label) {
                  if (labelHeight === 70) {
                    const _width = param.x - 6;
                    const _text = convertTextWithWrap(
                      canvasCtx,
                      param.fields[0].label,
                      _width,
                      param.fontSize,
                    );
                    console.log(_text);

                    let _top = 0;
                    const lineValues = _text.split('\n');
                    const lines = lineValues.length - 1;
                    const _textHeight = lines * (param.fontSize + 1);

                    if (_textHeight < param.height) {
                      _top = (param.height - 2 - _textHeight) / 2;
                    }

                    lineValues.forEach((_lineVal, index) => {
                      const lineHeight = param.fontSize * (index + 1) + index * 1;
                      drawText(_lineVal, 4, param.y + _top + lineHeight, param.fontSize, 0);
                    });
                  } else {
                    const _text = convertTextWithWrap(
                      canvasCtx,
                      param.fields[0].label,
                      param.width,
                      param.fontSize,
                    );
                    console.log(_text);
                    const lineValues = _text.split('\n');

                    lineValues.forEach((_lineVal, index) => {
                      const lineHeight = param.fontSize * (index + 1) + index * 0.5;
                      drawText(
                        _lineVal,
                        param.x,
                        param.y + param.height + 0.5 + lineHeight,
                        param.fontSize,
                        0,
                      );
                    });
                  }
                }
              } else if (param.type === 'text' && param.fields?.length) {
                const _values = param.fields.reduce((_content, current) => {
                  _content.push(`${current.label}:${item[current.fieldName] || ''}`);
                  return _content;
                }, []);

                const spacing = 0.8;

                const _content = convertContent(
                  canvasCtx,
                  _values,
                  param.width, // 间距
                  param.height,
                  param.fontSize,
                  spacing,
                );
                console.log(_content.values, _content);
                _content.values.forEach((_lineVal, index) => {
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
                   */
                  const lineHeight = _content.fontSize * (index + 1) + index * spacing;
                  drawText(
                    _lineVal,
                    param.x,
                    param.y + _content.top + lineHeight,
                    _content.fontSize,
                    0,
                  );
                });
              }
            });

            endDrawLabel(() => {
              startPrint(1, () => {
                resolve(item);
              });
            });
          });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  // position: fixed;
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background-color: #fff;
  padding: 24rpx 32rpx;
  // display: flex;
  // align-items: center;
  box-shadow: 0px -2px 4px 0px #00000014;
}

.canvas-wrap {
  position: fixed;
  left: -10000px;
  bottom: 0;
  canvas {
    display: flex;
    left: 100%;
  }
}
</style>
