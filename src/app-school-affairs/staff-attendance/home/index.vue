<template>
  <page :title="pageTitle" custom-overflow="scroll">
    <view v-if="isLoading" class="loading-container">
      <u-loading :show="isLoading" :size="100">加载中，请稍后</u-loading>
    </view>
    <view v-else>
      <Statistics v-if="currentPageId === 'statistics'" :dept-data="deptData" />
      <MyApply v-if="currentPageId === 'apply'" />
      <MyAttendance v-if="currentPageId === 'attendance'" />
      <u-tabbar
        v-model="current"
        active-color="#176bfb"
        :list="tabbarList"
        @change="handleTabbar"
      ></u-tabbar>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import { defaultTabbarList, statisticTabbarList } from '../constants/constant';
import MyApply from '../myApply/index.vue';
import MyAttendance from '../myAttendance/index.vue';
import { fetchPersonPurview } from '../services/employeeAttendance';
import Statistics from '../statistics/index.vue';

type IDdeptData = {
  deptId: string;
  deptName: string;
};

let tabbarList = ref(defaultTabbarList);
const current = ref(0);
const pageTitle = ref('我的考勤');
const currentPageId = ref('attendance');
const isLoading = ref(true);
const deptData = ref({} as IDdeptData);

const handleTabbar = (index: number) => {
  pageTitle.value = tabbarList.value[index].text;
  currentPageId.value = tabbarList.value[index].id;
  uni.setNavigationBarTitle({
    title: tabbarList.value[index].text,
  });
};
const fetchPersonPurviewData = async () => {
  try {
    const res = await fetchPersonPurview();
    isLoading.value = false;
    if (res?.deptId && res?.deptName) {
      deptData.value = { ...res };
      tabbarList.value = statisticTabbarList.concat(tabbarList.value);
      uni.setNavigationBarTitle({
        title: tabbarList.value[0].text,
      });
      pageTitle.value = tabbarList.value[0].text;
      currentPageId.value = tabbarList.value[0].id;
    }
  } catch {
    isLoading.value = false;
  }
};
onBeforeMount(() => {
  fetchPersonPurviewData();
});
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
