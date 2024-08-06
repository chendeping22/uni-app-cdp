<template>
  <view class="input-outer">
    <login-input
      :val="codeValue"
      :placeholder="placeholder"
      type="number"
      :src="''"
      :maxlength="6"
      class="input-margin"
      @update="$emit('update', $event)"
    >
      <template #input-right
        ><text
          :class="{
            'verify-text': true,
            'not-disable': phoneValue && !phoneVerifyState,
            // 用于点击获取验证码后的样式覆写
            disable: verifyObject.timer,
          }"
          @click="onGetVerifyCode"
        >
          {{ verifyObject.text }}
        </text></template
      >
    </login-input>
  </view>
</template>
<script lang="ts">
import { EnvType } from '@/utils/env';
import { defaultFailText } from '@/utils/request';
import { showInfo } from '@/utils/tools';
import { defineComponent, reactive, ref, toRefs, watch } from 'vue';
import { requestSms } from '../../services/login';
import { RSAEncrypt } from '../../utils/encrypt';
import loginInput from './login-input.vue';
export default defineComponent({
  components: { loginInput },
  props: {
    phoneValue: {
      type: String,
      default: '',
    },
    codeValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '验证码',
    },
    checkAccountFlag: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    let isGettingVerifyCode = false;
    // 手机号的验证状态
    const phoneVerifyState = ref(false);
    // 验证码的文案
    const verifyObject = reactive({
      text: '获取验证码',
      timer: 0,
      currentIndex: 60,
    });

    // 获取验证码
    const onGetVerifyCode = async () => {
      if (props.phoneValue?.length !== 11 || !!verifyObject.timer) return;
      if (isGettingVerifyCode) return;
      try {
        isGettingVerifyCode = true;
        uni.showLoading();
        const debugSwitchStatus = [EnvType.EnvType_PROD].includes(import.meta.env.VITE_SERVER_ENV)
          ? 0
          : 1;
        const res = await requestSms(
          RSAEncrypt(props.phoneValue),
          props.checkAccountFlag,
          debugSwitchStatus,
        );
        if (debugSwitchStatus) {
          emit('update', res.captcha);
        }
        uni.hideLoading();
        setTimeout(() => {
          isGettingVerifyCode = false;
        }, 3000);
        uni.showToast({ title: '验证码已发送', icon: 'none' });
        clearInterval(verifyObject.timer);
        verifyObject.timer = setInterval(() => {
          const { currentIndex } = verifyObject;
          if (currentIndex == 0) {
            clearInterval(verifyObject.timer);
            verifyObject.timer = 0;
            verifyObject.text = '重新获取';
            verifyObject.currentIndex = 60;
            return;
          }
          verifyObject.currentIndex = currentIndex - 1;
          verifyObject.text = `${verifyObject.currentIndex}s`;
        }, 1000) as unknown as number;
        verifyObject.text = `${verifyObject.currentIndex}s`;
      } catch (e: any) {
        uni.hideLoading();
        showInfo(defaultFailText(e));
        setTimeout(() => {
          isGettingVerifyCode = false;
        }, 3000);
      }
    };
    watch(
      () => props.phoneValue,
      value => {
        if (value && value?.toString().length !== 11) phoneVerifyState.value = true;
        else phoneVerifyState.value = false;
      },
    );
    return { ...toRefs(props), verifyObject, phoneVerifyState, onGetVerifyCode };
  },
});
</script>
<style scoped lang="scss">
.input-outer {
  .verify-text {
    font-size: 30rpx;
    color: #86909c;
    white-space: nowrap;
    padding-left: 32rpx;
    height: 96rpx;
    line-height: 96rpx;
    border-left: 2rpx solid #0000000f;
    &.not-disable {
      color: $ui-color-primary;
    }
    &.disable {
      color: #91caff;
    }
  }
}
</style>
