<template>
  <button
    :disabled="disabled"
    :data-msg="msg"
    :class="['button', `${className} ${packageClass}`, `button-bg-color-${type}`, `button-${size}`]"
    :style="{ width: width }"
    :open-type="openType"
    @click.stop="_onClick"
    @getphonenumber="_onGetphonenumber"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { PropType } from 'vue';

export default {
  components: {},
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    class: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<'large'>,
      default: 'large',
    },
    width: {
      type: String,
      default: 'auto',
    },
    type: {
      type: String as PropType<'plain' | 'primary' | 'success' | 'error' | 'warnning' | 'white'>,
      default: 'primary',
    },
    colorType: {
      type: String,
      default: '',
    },
    openType: {
      type: String,
      default: '',
    },
    /** 只能传公共样式, 不能传页面内scope的样式 */
    className: {
      type: String,
      default: '',
    },
    msg: {
      type: [String, Object],
      default: '',
    },
  },
  emits: ['click', 'getphonenumber'],
  data() {
    return {
      canClick: true,
      timeoutHandle: null,
    };
  },
  onLoad() {},
  computed: {
    packageClass: state => state.class,
  },
  watch: {},
  methods: {
    _onClick(e) {
      this.timeoutHandle && clearTimeout(this.timeoutHandle);
      this.timeoutHandle = setTimeout(() => {
        this.canClick = true;
      }, 800);
      if (!this.canClick) return;
      this.canClick = false;

      this.$emit('click', e);
    },
    _onGetphonenumber(e) {
      this.$emit('getphonenumber', e);
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  width: auto;

  color: $ui-color-white;
  background: $ui-color-primary;

  display: flex;
  align-items: center;
  justify-content: center;

  &[disabled] {
    /** 先用important */
    background: $ui-color-line-default !important;
  }

  &::after {
    content: unset;
  }
}

.button {
  &.button-large {
    height: 96rpx;
    line-height: 96rpx;
    font-size: $ui-font-size-xt;
    border-radius: $ui-radius-button-default;
    margin-left: $ui-gap-large;
    margin-right: $ui-gap-large;
  }
  &.button-bg-color-plain {
    background: unset;
    color: $ui-color-base;
    height: unset;
    line-height: unset;
    font-size: $ui-font-size-secondary;
    border-radius: unset;
    margin: unset;
  }
  &.button-bg-color-primary {
    background: $ui-color-primary;
  }
  &.button-bg-color-error {
    background: $ui-color-error;
  }
  &.button-bg-color-success {
    background: $ui-color-success;
  }
  &.button-bg-color-warnning {
    background: $ui-color-warnning;
  }
  &.button-bg-color-white {
    background: $uni-bg-color;
    color: $ui-color-secondary;
    border: 1px solid $ui-color-line-default;
  }
}
</style>
