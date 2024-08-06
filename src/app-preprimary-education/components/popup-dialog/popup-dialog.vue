<template>
  <view class="uni-popup-dialog">
    <view class="uni-dialog-title">
      <text class="uni-dialog-title-text" :class="['uni-popup__' + dialogType]">{{
        titleText
      }}</text>
    </view>
    <view v-if="mode === 'base'" class="uni-dialog-content">
      <slot>
        <text class="uni-dialog-content-text">{{ content }}</text>
      </slot>
    </view>
    <view v-else class="uni-dialog-content">
      <slot>
        <input
          v-model="val"
          class="uni-dialog-input"
          type="text"
          :placeholder="placeholderText"
          :focus="focus"
        />
      </slot>
    </view>
    <view class="uni-dialog-button-group">
      <view v-if="showCancel" class="uni-dialog-button" @click="closeDialog">
        <text class="uni-dialog-button-text">{{ cancelText }}</text>
      </view>
      <view
        v-if="showConfirm"
        :class="['uni-dialog-button uni-border-left', { 'uni-border-left-double-btn': showCancel }]"
        @click="onOk"
      >
        <text class="uni-dialog-button-text uni-button-color">{{ okText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { initVueI18n } from '@dcloudio/uni-i18n';
import messages from '../uni-popup/i18n/index.js';
import popup from '../uni-popup/popup.js';
const { t } = initVueI18n(messages);
/**
 * PopUp 弹出层-对话框样式
 * @description 弹出层-对话框样式
 * @tutorial https://ext.dcloud.net.cn/plugin?id=329
 * @property {String} value input 模式下的默认值
 * @property {String} placeholder input 模式下输入提示
 * @property {String} type = [success|warning|info|error] 主题样式
 *  @value success 成功
 * 	@value warning 提示
 * 	@value info 消息
 * 	@value error 错误
 * @property {String} mode = [base|input] 模式、
 * 	@value base 基础对话框
 * 	@value input 可输入对话框
 * @property {String} content 对话框内容
 * @property {Boolean} beforeClose 是否拦截取消事件
 * @event {Function} confirm 点击确认按钮触发
 * @event {Function} close 点击取消按钮触发
 * @property {Boolean} showConfirm 是否显示确认按钮
 * @property {Boolean} showCancel 是否显示取消按钮
 */

export default {
  name: 'UniPopupDialog',
  mixins: [popup],
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    placeholder: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: 'error',
    },
    mode: {
      type: String,
      default: 'base',
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    okText: {
      type: String,
      default: () => t('uni-popup.ok'),
    },
    cancelText: {
      type: String,
      default: () => t('uni-popup.cancel'),
    },
    beforeClose: {
      type: Boolean,
      default: false,
    },
    showConfirm: {
      type: Boolean,
      default: true,
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['confirm', 'close'],
  data() {
    return {
      dialogType: 'error',
      focus: false,
      val: '',
    };
  },
  computed: {
    placeholderText() {
      return this.placeholder || t('uni-popup.placeholder');
    },
    titleText() {
      return this.title || t('uni-popup.title');
    },
  },
  watch: {
    type(val) {
      this.dialogType = val;
    },
    mode(val) {
      if (val === 'input') {
        this.dialogType = 'info';
      }
    },
    value(val) {
      this.val = val;
    },
  },
  created() {
    // 对话框遮罩不可点击
    this.popup.disableMask && this.popup.disableMask();
    // this.popup.closeMask()
    if (this.mode === 'input') {
      this.dialogType = 'info';
      this.val = this.value;
    } else {
      this.dialogType = this.type;
    }
  },
  mounted() {
    this.focus = true;
  },
  methods: {
    /**
     * 点击确认按钮
     */
    onOk() {
      if (this.mode === 'input') {
        this.$emit('confirm', this.val);
      } else {
        this.$emit('confirm');
      }
      if (this.beforeClose) return;
      this.popup.close && this.popup.close();
    },
    /**
     * 点击取消按钮
     */
    closeDialog() {
      this.$emit('close');
      if (this.beforeClose) return;
      this.popup.close && this.popup.close();
    },
    close() {
      this.popup.close && this.popup.close();
    },
  },
};
</script>

<style lang="scss" scoped>
.uni-popup-dialog {
  width: 300px;
  border-radius: 15px;
  background-color: $ui-color-white;
}

.uni-dialog-title {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  justify-content: center;
  padding-top: 15px;
  padding-bottom: 5px;
}

.uni-dialog-title-text {
  font-size: $ui-font-size-title;
  font-weight: 500;
}

.uni-dialog-content {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 15px 15px 15px;
}

.uni-dialog-content-text {
  font-size: $ui-font-size-content;
  color: $ui-color-placeholder;
}

.uni-dialog-button-group {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  border-top-color: $ui-color-line-default;
  border-top-style: solid;
  border-top-width: 1px;
}

.uni-dialog-button {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */

  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 45px;
}

.uni-border-left {
  border-left-color: $ui-color-line-default;
  border-left-width: 1px;
}

.uni-border-left-double-btn {
  border-left-style: solid;
}

.uni-dialog-button-text {
  font-size: $ui-font-size-content;
}

.uni-button-color {
  color: $ui-color-primary;
}

.uni-dialog-input {
  flex: 1;
  font-size: $ui-font-size-content;
  border: 1px #eee solid;
  height: 40px;
  padding: 0 10px;
  border-radius: 5px;
  color: $ui-color-secondary;
}

.uni-popup__success {
  color: $ui-color-success;
}

.uni-popup__warn {
  color: $ui-color-warnning;
}

.uni-popup__error {
  color: $ui-color-error;
}

.uni-popup__info {
  color: $ui-color-placeholder;
}
</style>
