<template>
  <page custom-overflow="scroll">
    <view v-show="pageState === 1" style="height: 100%">
      <ValidateForm @confirm="pageState = 2"
    /></view>
    <view v-show="pageState === 2"> <listPage></listPage></view>
  </page>

  <!-- <template v-else-if="pageState === 3">
    <resetPage @confirm="pageState = 2" />
  </template>
  <template v-else-if="pageState === 4">
    <forgetPage @confirm="pageState = 2" />
  </template> -->
</template>

<script setup lang="ts">
import { getPsConfig } from '@/app-teacher-personnel/payslip/api/password';
import ValidateForm from '@/app-teacher-personnel/payslip/components/validate-form.vue';
import listPage from '@/app-teacher-personnel/payslip/list/index.vue';
// import forgetPage from '@/app-teacher-personnel/payslip/forget/index.vue';
// import resetPage from '@/app-teacher-personnel/payslip/reset/index.vue';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

// 1 密码验证页面 2正常的list页面 3忘记密码页面
const pageState = ref();

const getPageState = async () => {
  try {
    const config = await getPsConfig();
    if (config?.enablePassword === 0) {
      pageState.value = 2;
    } else {
      pageState.value = 1;
    }
  } catch (error) {}
};

onLoad(() => {
  getPageState();
});
</script>

<style scoped lang="scss"></style>
