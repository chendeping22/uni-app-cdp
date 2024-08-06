<template>
  <page custom-overflow="scroll">
    <view class="payslip-page">
      <view class="payslip-reset">
        <view class="title1">修改工资条查询密码</view>
        <PsForm formType="2" ref="psForm"></PsForm>
        <DescTip
          title="查询密码需要设为8个及以上字符，可以由数字和字母组成，不要输入特殊字符。"
        ></DescTip>
        <u-button type="primary" @click="confirmFirst">确定</u-button>
      </view>
    </view>
  </page>
</template>

<script setup lang="ts">
import { modifyPasswordRequest } from '@/app-teacher-personnel/payslip/api/password';
import DescTip from '@/app-teacher-personnel/payslip/components/desc-tip.vue';
import PsForm from '@/app-teacher-personnel/payslip/components/ps-form.vue';
import { RSAEncrypt } from '@/app-teacher-personnel/payslip/helper/encrypt';
import { ref } from 'vue';

const psForm = ref();

async function confirmFirst() {
  try {
    const values = await psForm.value?.validate();
    const encodeData = {
      originalPassword: RSAEncrypt(values.ps_old),
      password: RSAEncrypt(values.ps1),
      // confirmPwd: RSAEncrypt(values.ps1),
    };
    const res = await modifyPasswordRequest(encodeData);
    if (res) {
      uni.showToast({
        title: '密码修改成功',
        icon: 'success',
        duration: 3000,
        mask: false,
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
    }
  } catch (e) {}
}
</script>

<style scoped lang="scss">
.payslip-page {
  background-color: #fff;
  height: 100%;
}
.payslip-reset {
  padding: px2rpx(12) px2rpx(16);
  .title1 {
    @include title-3-medium;
    margin-bottom: px2rpx(12);
    color: rgba($color-text-base, 0.88);
  }
}
</style>
