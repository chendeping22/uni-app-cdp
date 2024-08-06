<template>
  <view class="payslip-page">
    <view
      v-if="state === PageStageEum.LOADING"
      style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center"
    >
      <u-loading></u-loading>
    </view>

    <view v-if="state === PageStageEum.FIRST_CONFIG" class="payslip-first">
      <view class="tip1"> 您所查询的内容属于隐私信息，第一次查询，请先设置您的查询密码 </view>
      <PhoneTip></PhoneTip>
      <PsForm ref="psForm" form-type="1"></PsForm>
      <DescTip
        title="查询密码需要设为8个及以上字符，可以由数字和字母组成，不可包含特殊字符。"
      ></DescTip>
      <u-button type="primary" @click="confirmFirst">确定</u-button>
    </view>
    <view v-if="state === PageStageEum.NO_FIRST_CONFIG" class="payslip-no-first">
      <u-avatar size="120" :src="userInfo?.headImageUrl || avatarDefault"></u-avatar>
      <view class="name">{{ userInfo?.name }}</view>
      <view style="width: 100%; margin-bottom: 24rpx">
        <!-- <u-input
            v-model="ps_search"
            type="password"
            :border="true"
            placeholder="请输入查询密码"
            :custom-style="{ fontSize: '32rpx' }"
          /> -->
        <PsInput v-model="ps_search" placeholder="请输入查询密码" :border="true"></PsInput>
      </view>
      <view style="width: 100%"
        ><u-button :custom-style="{ width: '100%' }" type="primary" @click="confirmNoFirst"
          >查看工资条</u-button
        ></view
      >

      <view class="bottom1">
        <view class="text" @click="goResetPage">修改密码</view>
        <view class="text" @click="goForgetPage">忘记密码？</view>
      </view>
    </view>
  </view>

  <!-- <u-modal v-model="showModal" title="" :show-confirm-button="false" :show-cancel-button="false">
      <view class="modal-inner">
        <image class="modal-image" :src="successSvg"></image>
        <view class="modal-desc1">设置成功！</view>
        <view class="modal-desc2">请妥善保存密码，下次输入此密码查看工资详情</view>
        <u-button :custom-style="{ width: '100%' }" type="primary" @click="goListPage"
          >确定({{ seconds }}秒即将跳转详情页)</u-button
        >
      </view>
    </u-modal> -->
  <PsModal :showModal="showModal" :seconds="seconds" @confirm="goListPage"></PsModal>
</template>

<script setup lang="ts">
import {
  hasPasswordRequest,
  updatePasswordRequest,
  validPasswordRequest,
} from '@/app-teacher-personnel/payslip/api/password';
import PsModal from '@/app-teacher-personnel/payslip/components/PsModal.vue';
import DescTip from '@/app-teacher-personnel/payslip/components/desc-tip.vue';
import PhoneTip from '@/app-teacher-personnel/payslip/components/phone-tip.vue';
import PsForm from '@/app-teacher-personnel/payslip/components/ps-form.vue';
import PsInput from '@/app-teacher-personnel/payslip/components/ps-input.vue';
import { RSAEncrypt } from '@/app-teacher-personnel/payslip/helper/encrypt';
import { PageStageEum } from '@/app-teacher-personnel/payslip/helper/enum';
import avatarDefault from '@/static/avatar.png';
import { loginStore } from '@/store/modules/login';
import { ref } from 'vue';

const englishNum = (min: number, max: number) =>
  new RegExp(`^[0-9a-zA-Z]${min ? `{${min},${max}}` : '+'}$`);

const DEFAULT_TIME = 3;

// const props = defineProps({
//   // 1首页使用  2详情页使用（消息中心或者待办中心进入需要密码验证需求）
//   fromType: {
//     type: String as PropType<'1' | '2'>,
//     default: '1',
//   },
// });
const emits = defineEmits(['confirm', 'reset', 'forget']);

const store = loginStore();
const { userInfo } = store;

const showModal = ref(false);
const psForm = ref();
const ps_search = ref();
const state = ref(PageStageEum.LOADING);
const timeId = ref();
const seconds = ref(DEFAULT_TIME);

function goResetPage() {
  // emits('reset');
  uni.navigateTo({
    url: '/app-teacher-personnel/payslip/reset/index',
  });
}
function goForgetPage() {
  // emits('forget');

  uni.navigateTo({
    url: '/app-teacher-personnel/payslip/forget/index',
  });
}

function goListPage() {
  if (timeId.value) {
    clearInterval(timeId.value);
  }
  // if (props.fromType === '1') {
  //   uni.redirectTo({
  //     url: '/app-teacher-personnel/payslip/list/index',
  //   });
  // }
  emits('confirm');
}

function setTimeoutGo() {
  timeId.value = setInterval(() => {
    seconds.value--;
    if (seconds.value === 0) {
      clearInterval(timeId.value);
      seconds.value = DEFAULT_TIME;
      goListPage();
    }
  }, 1000);
}

const getPageState = async () => {
  try {
    const res = await hasPasswordRequest();
    const { hasPassword: _hasPassword, mobile = '' } = res || {};
    state.value = !_hasPassword ? PageStageEum.FIRST_CONFIG : PageStageEum.NO_FIRST_CONFIG;
  } catch (error) {}
};

// onShow(() => {
//   getPageState();
// });

getPageState();

async function confirmFirst() {
  try {
    const values = await psForm.value?.validate();
    const encodeData = {
      captcha: values.captcha,
      password: RSAEncrypt(values.ps1),
      // confirmPwd: RSAEncrypt(values.ps1),
    };
    const res = await updatePasswordRequest(encodeData);
    if (res) {
      showModal.value = true;
      setTimeoutGo();
    }
  } catch (e) {}
}

async function confirmNoFirst() {
  let errorDesc = '';
  if (!ps_search.value) {
    errorDesc = '请输入查询密码';
  }
  //  else if (!englishNum(8, 16).test(ps_search.value)) {
  //   errorDesc = '密码只允许输入8-16位数字和字母';
  // }
  if (errorDesc) {
    uni.showToast({
      title: errorDesc,
      icon: 'none',
      duration: 3000,
      mask: false,
    });
    return;
  }
  try {
    const pwd = RSAEncrypt(ps_search.value);
    const res = await validPasswordRequest({ password: pwd });
    if (!res) {
      uni.showToast({
        title: '工资查询密码错误',
        icon: 'none',
        duration: 3000,
        mask: false,
      });
      return;
    }
    goListPage();
  } catch (e) {
    uni.showToast({
      title: '工资查询密码错误',
      icon: 'none',
      duration: 3000,
      mask: false,
    });
  }
}
</script>

<style scoped lang="scss">
.payslip-page {
  background-color: #fff;
  height: 100%;
}
.payslip-first {
  padding: px2rpx(12) px2rpx(16);
  .tip1 {
    @include subheadline-regular;
    margin-bottom: px2rpx(12);
    color: rgba($color-text-base, 0.65);
  }
}
.payslip-no-first {
  padding: px2rpx(12) px2rpx(16);
  display: flex;
  flex-direction: column;
  align-items: center;
  .name {
    margin: px2rpx(6) 0 px2rpx(12);
    @include body-medium;
    color: rgba($color-text-base, 0.88);
  }
  .bottom1 {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: px2rpx(12);
    .text {
      color: $color-primary;
      font-size: px2rpx(16);
    }
  }
}
</style>
