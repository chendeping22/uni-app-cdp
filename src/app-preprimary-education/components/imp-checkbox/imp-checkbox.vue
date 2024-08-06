<template>
  <view class="check">
    <view :class="['checkbox', value && 'checked']" @click="_onClick">
      <uni-icons
        v-if="value"
        size="14"
        class="checkmarkempty"
        type="checkmarkempty"
        color="#fff"
      ></uni-icons
    ></view>
    <text class="check-text">
      <slot></slot>
    </text>
  </view>
</template>

<script lang="ts">
export default {
  components: {},
  props: {
    value: {
      type: [String, Number],
      defalut: '',
    },
  },
  emits: ['click'],
  data() {
    return {};
  },
  onLoad() {},
  computed: {},
  watch: {},
  methods: {
    _onClick() {
      this.$emit('click');
    },
  },
};
</script>

<style lang="scss" scoped>
.check {
  display: flex;
  align-items: center;
  .check-text {
    margin-left: $ui-gap-small;
  }
}
.checkbox {
  position: relative;
  display: inline-block;
  width: 32rpx;
  height: 32rpx;
  margin-right: 0;
  vertical-align: text-bottom;
  border-radius: $ui-radius-xl;
  border: 2px solid #e6e8eb;
  box-sizing: border-box;
  &.checked {
    background: $ui-color-primary;
    border: unset;
    .checkmarkempty {
      position: absolute;
      width: 100%;
      height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      ::v-deep {
        span {
          line-height: 15px;
        }
      }
      .uni-icons {
        // #ifdef MP-WEIXIN
        position: relative;
        // top: -4rpx;
        margin: auto;
        width: 28rpx;
        height: 28rpx;
        line-height: 28rpx;
        display: block;
        // #endif
      }
    }
  }
}
</style>
