<template>
  <view class="ps-form">
    <view v-if="formType !== '2'" class="ps-form-item">
      <view class="title">短信验证码</view>
      <view class="captcha-area">
        <view class="captcha-input">
          <u-input
            v-model="captcha"
            :border="false"
            placeholder="请输入"
            :custom-style="{ fontSize: '32rpx' }"
          />
        </view>
        <view
          class="code-area"
          :style="{ color: getPhoneCodeState.disabled ? '' : '#1677FF' }"
          @click="getPhoneCodeState.disabled ? () => {} : onSendCode()"
          >{{ getPhoneCodeState.btnText }}</view
        >
      </view>
    </view>
    <view v-if="formType === '2'" class="ps-form-item">
      <view class="ps-form-item-inner">
        <view class="title">请输入原密码</view>
        <PsInput v-model="ps_old" placeholder="请输入"></PsInput>
        <!-- <u-input
          v-model="ps_old"
          type="password"
          :border="false"
          placeholder="请输入"
          :custom-style="{ fontSize: '32rpx' }"
        />
        <image :src="eyeOnSvg" class="eye-svg"> </image> -->
      </view>
    </view>
    <view class="ps-form-item">
      <view class="ps-form-item-inner">
        <view class="title">{{ text.ps1 }}</view>
        <!-- <u-input
          v-model="ps1"
          type="password"
          :border="false"
          placeholder="请输入"
          :custom-style="{ fontSize: '32rpx' }"
        /> -->
        <PsInput v-model="ps1" placeholder="请输入"></PsInput>
      </view>
    </view>
    <view class="ps-form-item">
      <view class="ps-form-item-inner">
        <view class="title">{{ text.ps2 }}</view>
        <!-- <u-input
          v-model="ps2"
          type="password"
          :border="false"
          placeholder="请输入"
          :custom-style="{ fontSize: '32rpx' }"
        /> -->
        <PsInput v-model="ps2" placeholder="请输入"></PsInput>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { sendCaptcha } from '@/app-teacher-personnel/payslip/api/password';
import PsInput from '@/app-teacher-personnel/payslip/components/ps-input.vue';
import { loginStore } from '@/store/modules/login';
import { EnvType } from '@/utils/env';
import { PropType, computed, ref, unref } from 'vue';
import useCountDown from './useCountDown';

const englishNum = (min: number, max: number) =>
  new RegExp(`^[0-9a-zA-Z]${min ? `{${min},${max}}` : '+'}$`);

const props = defineProps({
  formType: {
    type: String as PropType<'1' | '2' | '3'>, // 1:首次进入 2:修改密码 3:忘记密码
    require: true,
  },
});

const isProd = import.meta.env.VITE_SERVER_ENV === EnvType.EnvType_PROD;

const store = loginStore();
const { userInfo } = store;

const debug = ref(isProd ? false : true);

const captcha = ref();
const ps_old = ref();
const ps1 = ref();
const ps2 = ref();

const text = computed(() => {
  if (props.formType === '2') {
    return {
      ps1: '请输入新密码',
      ps2: '再次输入新密码 ',
    };
  }

  return {
    ps1: '工资查询密码',
    ps2: '确认查询密码',
  };
});

const { time, handleStart } = useCountDown(59);
const getPhoneCodeState = computed(() => {
  if (time.value <= 0) {
    return {
      disabled: false,
      btnText: '获取验证码',
      // btnText: clickCountDownBtnDone.value ? '重新获取' : '获取验证码',
    };
  } else {
    return {
      disabled: true,
      btnText: `${time.value}s`,
    };
  }
});
async function onSendCode() {
  try {
    const res = await sendCaptcha({
      phone: userInfo?.tel,
      debug: +debug.value,
    });
    const { captcha: _captcha = '', code } = res || {};
    if (_captcha && debug.value) {
      captcha.value = _captcha;
    }
    handleStart();
  } catch (error) {
    // createMessage.error(error || '获取验证码失败');
    // console.log('error', error);
  }
}

function checkValues() {
  if (!captcha.value && props.formType !== '2') {
    return '请输入验证码';
  }
  if (props.formType === '1') {
    if (!ps1.value) {
      return '请输入工资查询密码';
    }
    if (!ps2.value) {
      return '请输入确认查询密码';
    }
  }
  if (props.formType === '2') {
    if (!ps_old.value) {
      return '请输入旧密码';
    }
    if (!ps1.value) {
      return '请输入新密码';
    }
    if (!ps2.value) {
      return '请输入确认密码';
    }
  }
  if (props.formType === '3') {
    if (!ps1.value) {
      return '请输入工资查询密码';
    }
    if (!ps2.value) {
      return '请输入确认查询密码';
    }
  }

  if (
    !englishNum(8, 16).test(ps1.value) ||
    !englishNum(8, 16).test(ps2.value) ||
    (props.formType === '2' && !englishNum(8, 16).test(ps_old.value))
  ) {
    return '密码只允许输入8-16位数字和字母';
  }
  if (ps1.value !== ps2.value) {
    return '两次密码输入不一致';
  }
  return '';
}

defineExpose({
  validate: () => {
    return new Promise((resolve, reject) => {
      const errorMsg = checkValues();
      if (errorMsg) {
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000,
          mask: false,
        });

        reject(errorMsg);
      }

      resolve({ ps1: unref(ps1), ps2: unref(ps2), captcha: unref(captcha), ps_old: unref(ps_old) });
    });
  },
});
</script>

<style scoped lang="scss">
.ps-form {
  margin-bottom: px2rpx(12);
  border-radius: px2rpx(8);
  border: 2rpx solid #00000026;
  padding-left: px2rpx(16);
  .ps-form-item {
    padding: px2rpx(16) 0 px2rpx(10);
    & + .ps-form-item {
      border-top: 1rpx solid #00000026;
    }
    &-inner {
      padding-right: px2rpx(16);
    }
    .title {
      margin-bottom: px2rpx(2);
    }
    .captcha-area {
      display: flex;
      align-items: center;
      padding-right: px2rpx(16);
      .captcha-input {
        flex: 1;
      }
      .code-area {
        padding: 0 0 0 32rpx;
        border-left: 1px solid rgba(0, 0, 0, 0.06);
        height: 44rpx;
        font-size: 32rpx;
      }
    }
  }
}
</style>
