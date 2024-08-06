<template>
  <page style="background-color: white">
    <view class="content">
      <steps
        class="steps"
        :active-color="primaryColor"
        :title-colors="['#000000e0', primaryColor, '#00000073']"
        :options="datas"
        :active="activeStep"
      />
      <view v-if="activeStep === 0" class="input-content">
        <login-input
          v-model:val="phoneValue"
          placeholder="请输入手机号码"
          type="number"
          :maxlength="11"
          class="input-margin"
          @update="phoneValue = $event"
          @clickIcon="phoneValue = ''"
        ></login-input>
        <verify-input
          class="input-margin"
          :phone-value="phoneValue"
          :code-value="codeValue"
          :placeholder="'请输入验证码'"
          @update="codeValue = $event"
        >
        </verify-input>
        <view
          :class="['custom-button', phoneLoginDisableState ? 'color-primary-disable' : '']"
          @click="nextStepAction"
          >下一步</view
        >
      </view>
      <view v-else-if="activeStep === 1" class="input-content">
        <login-input
          v-model:val="newPwdValue"
          placeholder="8-20位字母/数字/特殊符号，3种组合"
          type="password"
          :maxlength="20"
          class="input-margin"
          @update="newPwdValue = $event"
          @clickIcon="newPwdValue = ''"
        ></login-input>
        <login-input
          v-model:val="confirmPwdValue"
          placeholder="请再次输入新的登录密码"
          type="password"
          :maxlength="20"
          class="input-margin"
          @update="confirmPwdValue = $event"
          @clickIcon="confirmPwdValue = ''"
        ></login-input>
        <view
          :class="['custom-button', confirmDisableState ? 'color-primary-disable' : '']"
          @click="confirmAction"
          >确定</view
        >
      </view>
      <view v-else class="success">
        <image src="@/app-platform/static/login/icon_step_success.svg"></image>
        <text>密码重置成功</text>
        <view class="custom-button back-button" @click="backAction">返回登录</view>
      </view>
    </view>
  </page>
</template>

<script lang="ts">
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { defaultFailText } from '@/utils/request';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import SparkMD5 from 'spark-md5';
import { defineComponent, ref, watchEffect } from 'vue';
import { resetPwd, verifyPhoneNumber } from '../services/login';
import { RSAEncrypt } from '../utils/encrypt';
import { validatePassword } from '../utils/tools';
import loginInput from './components/login-input.vue';
import steps from './components/steps.vue';
import verifyInput from './components/verify-input.vue';

export default defineComponent({
  components: { steps, loginInput, verifyInput },
  setup() {
    // 初始化数据
    const datas = ref([
      {
        title: '验证手机',
      },
      {
        title: '设置密码',
      },
      {
        title: '重置成功',
      },
    ]);
    // 激活步骤
    const activeStep = ref(0);
    // 手机号的值
    const phoneValue = ref('');
    // 验证码的值
    const codeValue = ref('');
    // 手机登录按钮的禁用状态 true 禁用
    const phoneLoginDisableState = ref(true);
    // 手机号验证ok
    const verifyOKCode = ref('');
    // 新密码
    const newPwdValue = ref('');
    // 确定密码
    const confirmPwdValue = ref('');
    const confirmDisableState = ref(true);
    const primaryColor = getPrimaryColor();

    // 下一步
    const nextStepAction = async () => {
      if (phoneLoginDisableState.value) {
        return;
      }

      try {
        showLoading();
        const verifyCode = await verifyPhoneNumber(
          RSAEncrypt(phoneValue.value) || '',
          codeValue.value,
        );
        verifyOKCode.value = verifyCode as string;
        activeStep.value = 1;
        hideLoading();
      } catch (error) {
        hideLoading();
        showInfo(defaultFailText(error));
      }
    };
    //确定
    const confirmAction = async () => {
      if (confirmDisableState.value) {
        return;
      }

      if (newPwdValue.value !== confirmPwdValue.value) {
        showInfo('两次密码不一致');
        return;
      }

      try {
        showLoading();
        await validatePassword(newPwdValue.value);
        const verifyCode = await resetPwd(
          RSAEncrypt(phoneValue.value) || '',
          SparkMD5.hash(newPwdValue.value),
          verifyOKCode.value,
          phoneValue.value,
        );
        verifyOKCode.value = verifyCode as string;
        activeStep.value = 2;
        hideLoading();
      } catch (error) {
        hideLoading();
        showInfo(defaultFailText(error));
      }
    };
    // 返回
    const backAction = () => {
      uni.navigateBack();
    };
    watchEffect(() => {
      if (
        phoneValue.value &&
        phoneValue.value?.toString().length === 11 &&
        codeValue.value &&
        codeValue.value?.toString().length > 0
      ) {
        phoneLoginDisableState.value = false;
      } else {
        phoneLoginDisableState.value = true;
      }

      if (
        newPwdValue.value &&
        newPwdValue.value?.toString().length >= 8 &&
        confirmPwdValue.value &&
        confirmPwdValue.value?.toString().length >= 8
      ) {
        confirmDisableState.value = false;
      } else {
        confirmDisableState.value = true;
      }
    });
    return {
      datas,
      primaryColor,
      activeStep,
      phoneValue,
      codeValue,
      phoneLoginDisableState,
      newPwdValue,
      confirmPwdValue,
      confirmDisableState,
      nextStepAction,
      confirmAction,
      backAction,
      verifyOKCode,
    };
  },
});
</script>

<style lang="scss" scoped>
:deep(.page) {
  background-color: white !important;
}

.content {
  .steps {
    display: block;
    margin-top: 48rpx;
  }

  .input-content {
    display: flex;
    flex-direction: column;
    padding: 16rpx 48rpx 0;

    .input-margin {
      margin-top: 32rpx;
    }
  }

  .custom-button {
    margin-top: 48rpx;
    height: 104rpx;
    color: white;
    font-size: 34rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    border-radius: 16rpx;
    background: $ui-color-primary;
  }

  .success {
    display: flex;
    flex-direction: column;
    align-items: center;

    image {
      margin-top: 108rpx;
      width: 120rpx;
      height: 120rpx;
    }

    text {
      margin-top: 36rpx;
      margin-bottom: 48rpx;
      color: #000000e0;
      font-size: 40rpx;
      height: 52rpx;
      line-height: 52rpx;
      font-weight: 500;
    }

    .back-button {
      margin-left: 48rpx;
      margin-right: 48rpx;
    }
  }

  .color-primary-disable {
    background: #91caff;
  }
}
</style>
