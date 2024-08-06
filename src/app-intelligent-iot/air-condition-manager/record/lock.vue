<script setup lang="ts">
import { getPublicFuncProxy } from "@/app-intelligent-iot/vision-health/utils";
import { onLoad } from '@dcloudio/uni-app';
import DayJS from 'dayjs';
import { isEmpty } from 'lodash-es';
import { reactive, ref } from 'vue';
import { loadDeviceLog } from '../../services/air-condition';
import { useCondition } from '../store/useCondition';
import { CTRL_WAY, type TLockRecord } from '../type';
import DateList from './components/date-list.vue';

const { proxy } = getPublicFuncProxy();

const uc = useCondition();
const deviceId = ref('');
const refreshState = ref<boolean>(false);
const loadMoreState = ref('loadmore');
const lockData = reactive<{ value: { [key: string]: TLockRecord[] } }>({ value: {} });
const pageNum = ref(1);
const pageSize = 15;

const pushPageData = (list: TLockRecord[], pageIndex: number) => {
  if (isEmpty(list)) {
    if (pageIndex == 1) {
      lockData.value = {};
    }
    refreshState.value = false;
    loadMoreState.value = 'nomore';
    return;
  }
  pageNum.value = pageIndex + 1;
  loadMoreState.value = list.length < pageSize ? 'nomore' : 'loadmore';
  let result = {};
  if (pageIndex == 1) {
    refreshState.value = false;
  } else {
    result = lockData.value;
  }
  list.forEach(item => {
    const date = item.startTime ? DayJS(item.startTime).format('YYYY-MM-DD') : '';
    if (date in result) {
      result[date].push(item);
    } else {
      result[date] = [item];
    }
  });
  lockData.value = result;
};

const loadPageData = async (pageIndex: number) => {
  try {
    const params = {
      controlWay: CTRL_WAY.Lock,
      pageNum: pageIndex,
      pageSize,
      deviceId: deviceId.value,
    };
    proxy.$publicFunc.showLoading('加载中...');
    const res: any = await loadDeviceLog(params);
    proxy.$publicFunc.hideLoading();
    pushPageData(res?.result || [], pageIndex);
  } catch (error) {
    console.log('error: ', error);
    proxy.$publicFunc.hideLoading();
  }
};

onLoad((option: any) => {
  deviceId.value = option.id;
  // 初始请求接口
  loadPageData(pageNum.value);
});

const onRefresh = () => {
  refreshState.value = true;
  loadPageData(1);
};

const onScrollBottom = () => {
  if (loadMoreState.value == 'nomore') return;
  loadMoreState.value = 'loading';
  loadPageData(pageNum.value);
};

const onRecordClick = (data: TLockRecord) => {
  uc.$set({ lockRecord: data });
  uni.navigateTo({
    url: '/app-intelligent-iot/air-condition-manager/record/lock-detail',
  });
};
</script>

<template>
  <scroll-view
    :scroll-y="true"
    class="container"
    refresher-background="transparent"
    refresher-enabled="true"
    :refresher-triggered="refreshState"
    @refresherrefresh="onRefresh"
    @scrolltolower="onScrollBottom"
  >
    <date-list :lock-data="lockData.value" @onItemClick="onRecordClick" />
  </scroll-view>
</template>

<style lang="scss" scoped>
.container {
  // #ifdef H5
  height: calc(100vh - 88rpx);
  // #endif
  // #ifdef APP-PLUS || MP-WEIXIN
  height: 100vh;
  // #endif
  overflow: auto;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}
</style>
