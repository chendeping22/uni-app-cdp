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
</template>

<script>
import { log } from '@/utils/tools';
import { ERROR_MSG_MAP } from '../../hooks/print/utils';
import PrintProgressModal from './print-progress-modal.vue';
const JCAPI = uni.requireNativePlugin('JCSDK-JCApiModule');

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
      printQueue: [],
      sendedIndex: 0,
      isSendError: false,
    };
  },
  mounted() {
    this.createPrintQueue();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    JCAPI.didReadPrintCountInfo(res => {
      // _this.printedCount = _this.stopFinishCount + res.count;
      _this.printedCount = _this.printedCount + 1;
      log('打印进度 count：，已发送的条数', res, _this.list.length - this.printQueue.length);
      // 全部打印完成
      if (_this.printedCount === _this.list.length) {
        // 清空选中的
        _this.resetPrintData();
        uni.showToast({
          title: `共${_this.list.length}个资产二维码已打印完成`,
          icon: 'none',
          mask: true,
          duration: 1500,
        });
        _this.$refs.PrintProgressModalRef.close();

        setTimeout(() => {
          uni.navigateBack();
        }, 1000);
      } else if (_this.isStop) {
        // 暂停打印时，在打完下一个再执行暂停
        JCAPI.cancelJob();
      } else if (_this.isSendError && _this.printedCount === _this.sendedIndex + 1) {
        _this.printError = '打印数据发送异常，请重试';
        // 暂停打印发送的数据异常，并且已全部打完已完成数据
        JCAPI.cancelJob();
      }
    });

    JCAPI.didReadPrintErrorInfo(res => {
      log('打印出错 errCode: ', res);
      if (res.code == 23) {
        _this.setPrintDevice();
      }
      _this.printError =
        ERROR_MSG_MAP[res.code] ||
        (_this.isLinked ? '打印失败, 请检查打印机' : '已断开，请重新连接');
      // 打印出错 暂停打印
      _this.isStop = true;
      JCAPI.cancelJob(function (_r) {
        // callback
      });
    });
  },
  methods: {
    async handlePrint() {
      if (this.isStop) {
        const res = await this.checkConnected();
        this.sendedIndex = this.printedCount;
        this.isStop = false;
        this.startPrintJob();
        if (res && this.printError) {
          this.printError = '';
        }
      } else {
        this.isStop = true;
        // JCAPI.cancelJob(function (_r) {
        //   // callback
        // });
      }
    },
    handleCancelPrint() {
      JCAPI.cancelJob(function (_r) {
        // callback
      });
      uni.navigateBack();
    },
    async start() {
      while (this.sendedIndex < this.printQueue.length && !this.isStop) {
        log('file: print-button-app.vue:136 ~ start ~ this.sendedIndex:', this.sendedIndex);
        const _task = this.printQueue[this.sendedIndex]; // this.printQueue.splice(0, 1)[0];
        try {
          await _task();
          this.sendedIndex = this.sendedIndex + 1;
        } catch (error) {}
      }
    },
    startPrintJob() {
      if (!this.printQueue.length) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this;

      /**
       * 开始打印任务
       * @param {function} callback - 任务开启后的回调函数
       */
      JCAPI.startJob(
        {
          totalCount: _this.printQueue.length - _this.printedCount,
          density: _this.darkness,
          labelType: 1, // 1.间隙纸  2.黑标纸  3.连续纸  4.定孔纸  5.透明纸  6.标牌
          printMode: 2, // 1.热敏 2.热转印
        },
        () => {
          _this.start();
        },
      );
    },
    async printLabel() {
      this.$refs.PrintProgressModalRef.open();
      this.startPrintJob();
    },
    createPrintQueue() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this;

      //标签尺寸
      const labelWidth = this.template.width || 50;
      const labelHeight = this.template.height || 20;
      const multiple = 11.81;
      this.canvasWidth = labelWidth * multiple;
      this.canvasHeight = labelHeight * multiple;

      this.printQueue = _this.list.map(item => {
        return () =>
          new Promise(resolve => {
            _this.isSendError = false;
            _this.printError = '';

            JCAPI.initDrawingBoard({
              width: labelWidth,
              height: labelHeight,
              rotate: 0,
            });

            this.template.items?.map(param => {
              if (param.type === 'qrCode') {
                /**
                 * 绘制二维码
                 */
                const assetInfoQRCodeVO =
                  item[param.fields?.[0]?.fieldName || 'assetInfoQRCodeVO'] || {};

                JCAPI.drawLabelQrCode({
                  x: param.x,
                  y: param.y,
                  width: param.width,
                  height: param.height,
                  value: JSON.stringify(assetInfoQRCodeVO),
                  rotate: 0,
                  codeType: 31, // QrCode: 31, PDF417: 32, DataMatrix: 33, AZTEC: 34
                });

                if (param.fields?.[0]?.label) {
                  let _options;
                  if (labelHeight === 70) {
                    const _width = param.x - 6;
                    _options = {
                      x: 4,
                      y: param.y,
                      width: _width,
                      height: param.height - 2,
                    };
                  } else {
                    _options = {
                      x: param.x,
                      y: param.y + param.height + 0.5,
                      width: param.width,
                      height: labelHeight - param.height - param.y - 2.5,
                    };
                  }

                  log(param.fields[0].label);

                  JCAPI.drawLabelText({
                    fontSize: param.fontSize,
                    value: param.fields[0].label,
                    rotate: 0,
                    lineMode: 6, // 1.宽高固定，内容自适应（字号/字间距/行间距按比例缩放） 2. 宽度固定，高度自适应  4. 宽高固定，超出部分裁剪  6. 宽高固定，内容超过时预设宽高自动缩小
                    lineSpace: 0,
                    letterSpace: 0,
                    textAlignHorizontal: 0,
                    textAlignVertical: 1,
                    ..._options,
                  });
                }
              } else if (param.type === 'text' && param.fields?.length) {
                const _text = param.fields.reduce((_content, current) => {
                  return `${_content}\n${current.label}: ${item[current.fieldName] || ''}`;
                }, '');

                log(_text);

                JCAPI.drawLabelText({
                  x: param.x,
                  y: param.y - 1,
                  width: param.width,
                  height: param.height,
                  value: _text,
                  fontSize: param.fontSize,
                  rotate: 0,
                  lineMode: 6, // 1.宽高固定，内容自适应（字号/字间距/行间距按比例缩放） 2. 宽度固定，高度自适应  4. 宽高固定，超出部分裁剪  6. 宽高固定，内容超过时预设宽高自动缩小
                  lineSpace: 0,
                  letterSpace: 0,
                  textAlignHorizontal: 0,
                  textAlignVertical: 1,
                });
              }
            });

            // 生成打印数据
            let imageJsonObj = JCAPI.generateLabelJson();

            JCAPI.printData(
              imageJsonObj,
              {
                printQuantity: 1,
              },
              function (r) {
                log('发送打印数据完成，继续发送下一页', item);
                if (r.code == 0) {
                  resolve(item);
                } else {
                  log('printMultipleData fail', r);
                  reject();
                  _this.isSendError = true;
                  // _this.printError = '打印数据发送失败';
                }
              },
            );
          });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background-color: #fff;
  padding: 24rpx 32rpx;
  box-shadow: 0px -2px 4px 0px #00000014;
}
</style>
