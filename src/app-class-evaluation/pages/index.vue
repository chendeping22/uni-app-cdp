<script setup lang="ts">
import { ETerminal } from '@/store/modules/env';
import { loginStore } from '@/store/modules/login';
import { onLoad, onPageScroll, onPullDownRefresh } from '@dcloudio/uni-app';
import { computed, onUnmounted, ref, watch } from 'vue';
import { footList } from '../components/footer/constants';
import Footer from '../components/footer/index.vue';
import { useClassEvaluationStore } from '../store/class-evaluation';
import Evaluation from './evaluation/index.vue';
import Report from './report/index.vue';
import Statistics from './statistics/index.vue';

const loginStoreInfo = loginStore();
const store = useClassEvaluationStore();

const footCurrent = ref(1);

const scrollTop = ref<number>(1);

onPageScroll(e => {
  scrollTop.value = e.scrollTop;
});
// 解决iOS兼容性问题（部分机型需要超过一屏才可以）
const isIOSTerminal = loginStoreInfo.currentEnv.terminal === ETerminal.iOS;

const _footList = computed(() => {
  if (!store.loaded) {
    return [];
  }
  return store.data.isEvaluator ? footList : footList.filter(i => i.value !== 'evaluator');
});

watch(
  footCurrent,
  newVal => {
    uni.setNavigationBarTitle({
      title: footList[newVal] ? footList[newVal].title || footList[newVal].text : '班级点评',
    });
  },
  { immediate: true },
);

const initPage = async () => {
  await store.fetch();
  /** 老师 */
  // if (store.data.indentity === 0 && store.data.clazzIds?.[0]) {
  //   uni.navigateTo({
  //     url: `/app-class-evaluation/pages/report/classDetail/index?id=${
  //       store.data.clazzIds[0]
  //     }&=from=home`,
  //   });
  // } else
  /** 是点评人 并且是学生 */
  if (store.data.isEvaluator && store.data.indentity === 1) {
    footCurrent.value = 2;
  }
};

onLoad((options: any) => {
  if (options.tab) {
    footCurrent.value = +options.tab;
  }

  initPage();
});

onUnmounted(() => {
  store.$setLoaded(false);
});

onPullDownRefresh(() => {
  if (footCurrent.value === 0) {
    uni.stopPullDownRefresh();
  } else {
    uni.$emit('onPullDownRefreshFromEvaluationPage');
  }
});
</script>

<template>
  <page
    v-if="store.loaded"
    custom-overflow="visible"
    :class="`home-page ${isIOSTerminal ? ' home-page-ios' : ''}`"
  >
    <view class="home-page-content">
      <!-- 统计 -->
      <Statistics :scrollTop="scrollTop" v-if="footCurrent === 0"></Statistics>
      <!-- 报表 -->
      <Report v-else-if="footCurrent === 1"></Report>
      <!-- 设置 -->
      <!-- <view v-else-if="footCurrent === 3">设置</view> -->
      <!-- 点评 -->
      <Evaluation v-else-if="footCurrent === 2" />
      <!-- 设置 -->
      <view v-else-if="footCurrent === 3">设置</view>
    </view>
    <Footer v-model="footCurrent" :list="_footList" />
  </page>
  <view v-else />
</template>

<style lang="scss" scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  &-content {
    flex: 1;
  }
}

.home-page-ios {
  min-height: calc(100% + 1rpx);
}

:deep(.u-tabbar__content) {
  box-shadow: $shadow-light-up-md;
}
:deep(.evaluation-class-list .type-list:last-child) {
  border-bottom: none;
}

:deep(.evaluation-class-list .type-list .item-checkbox) {
  margin-right: 24rpx;
}

:deep(.table-wrap) {
  padding: 0 32rpx;
  .u-table {
    border-radius: 16rpx !important;
    border-right: 2rpx solid rgb(225, 225, 225) !important;
    overflow: hidden;
  }
  .u-th {
    height: 68rpx;
    color: #00000073;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 500;
  }
  .u-th,
  .u-td {
    overflow: hidden !important;
    border-right: none !important;
  }
  .u-td {
    height: 88rpx;
    color: #000000a6;
    font-family: 'PingFang SC';
    font-size: 30rpx;
    font-style: normal;
    font-weight: 400;
  }
}
</style>
