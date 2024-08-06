<template>
  <view class="imp-input-outer">
    <view class="login-input-wrapper">
      <input
        v-if="type === 'password'"
        class="login-input"
        :placeholder="placeholder"
        :value="val"
        :password="showPassword"
        :maxlength="maxlength"
        @input="$emit('update', ($event as any).detail.value)"
      />
      <input
        v-else
        class="login-input"
        :type="type"
        :placeholder="placeholder"
        :value="val"
        :maxlength="maxlength"
        @input="$emit('update', ($event as any).detail.value)"
      />
      <image
        v-if="showClearIcon || forceShowClearIcon"
        class="login-icon-close"
        :src="src"
        @click="$emit('clickIcon')"
      >
      </image>
    </view>
    <view class="input-right">
      <slot name="input-right"></slot>
    </view>
  </view>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch } from 'vue';
export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'text',
    },
    val: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    maxlength: {
      type: Number,
      default: 100,
    },
    src: {
      type: String,
      default: '/app-platform/static/login/icon_input_close.svg',
    },
    showPassword: {
      type: Boolean,
      default: true,
    },
    forceShowClearIcon: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update', 'clickIcon'],
  setup(props, { emit }) {
    let showClearIcon = ref(false);
    watch(
      () => props.val,
      newVal => {
        showClearIcon.value = newVal.length > 0;
        emit('update', newVal);
      },
    );
    return { ...toRefs(props), showClearIcon };
  },
});
</script>
<style scoped lang="scss">
.imp-input-outer {
  display: flex;
  align-items: center;
  box-sizing: content-box;
  padding: 0 36rpx 0 32rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: #0000000f;

  .login-input-wrapper {
    position: relative;
    flex-grow: 1;

    display: flex;
    justify-content: space-between;
    align-items: center;

    .login-input {
      flex: 1;
      font-size: 30rpx;
    }

    .login-icon-close {
      width: 40rpx;
      height: 40rpx;
      margin-left: 36rpx;
    }
  }

  .input-right {
    flex-grow: 0;
  }
}
</style>
