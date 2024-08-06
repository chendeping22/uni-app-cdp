<script setup lang="ts">
import SchemeEmpty from '@/app-class-evaluation/components/scheme-empty.vue';
import { getClassEvaluationSchemes } from '@/app-class-evaluation/services/statistics';
import { schemeStore } from '@/app-class-evaluation/store/scheme-store';
import { hideLoading, showLoading } from '@/utils/tools';
import { find } from 'lodash-es';
import { onBeforeMount, reactive, ref } from 'vue';
import ClassTab from './classTab/index.vue';
import HonorTab from './honorTab/index.vue';
import ScoreTab from './scoreTab/index.vue';

const props = defineProps<{ scrollTop: number }>();
const list = [{ name: '评分统计' }, { name: '荣誉统计' }, { name: '班级统计' }];
const current = ref<number>(0);
const change = (index: number) => {
  // console.log('index', index);
};
const store = schemeStore();
const state = reactive<{
  loading: boolean;
  schemesList: any[];
}>({
  loading: false,
  schemesList: [],
});
const fetchList = async () => {
  state.loading = true;
  try {
    showLoading();
    const res: any = await getClassEvaluationSchemes({});
    state.schemesList = res;
    store.$setSchemeMap(state.schemesList);
    store.$setSelectedSchemeMap(find(store.schemeMap, { isDefault: true }));
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.loading = false;
    hideLoading();
  }
};
onBeforeMount(() => {
  fetchList();
});
</script>

<template>
  <view class="statistics">
    <view class="statistics-tab">
      <u-tabs :list="list" :is-scroll="false" v-model="current" @change="change"></u-tabs>
    </view>
    <view class="statistics-scroll">
      <view v-if="state.loading" class="loading-view">
        <u-loading :show="state.loading" size="64" mode="flower"></u-loading>
      </view>
      <template v-else>
        <template v-if="state.schemesList.length">
          <ScoreTab :scrollTop="scrollTop" v-if="current === 0"></ScoreTab>
          <HonorTab
            v-if="current === 1"
            style="height: 100%"
            :schemesList="state.schemesList"
          ></HonorTab>
          <ClassTab :schemesList="state.schemesList" v-if="current === 2"></ClassTab>
        </template>
        <scheme-empty type="statistis" v-else></scheme-empty>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.statistics {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  &-tab {
    position: fixed;
    width: 100%;
    z-index: 998;
  }
}
.statistics-scroll {
  height: 100%;
  flex: 1;
  margin-top: 80rpx;
  padding-bottom: 112rpx;
}
.loading-view {
  height: 250rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
