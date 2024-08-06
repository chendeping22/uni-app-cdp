<script setup lang="ts">
import { getPublicFuncProxy } from "@/app-intelligent-iot/vision-health/utils";
import { onLoad } from '@dcloudio/uni-app';
import DayJS from 'dayjs';
import { isEmpty } from 'lodash-es';
import { computed, reactive, ref } from 'vue';
import { loadMemberLog } from '../../services/air-condition';
import { CTRL_WAY, type TGroupRecord } from '../type';
import DateList from './components/date-list.vue';

type TOption = {
  label: string;
  value: number;
  index?: number;
}

const options: TOption[] = [
  { label: '全部', value: 0 },
  { label: '组控', value: CTRL_WAY.Group },
  { label: '锁定', value: CTRL_WAY.Lock },
];

const { proxy } = getPublicFuncProxy();

const groupId = ref('');
const refreshState = ref<boolean>(false);
const loadMoreState = ref('loadmore');
const groupData = reactive<{ value: { [key: string]: TGroupRecord[] } }>({ value: {} });
const pageNum = ref(1);
const pageSize = 15;
const isPickerShow = ref(false);
const controlWay = ref(0);
const selectIndex = ref(0);

const controlWayDesc = computed(() => {
  const result = options.find(item => item.value === controlWay.value);
  return result?.label || '';
});

const pushPageData = (list: TGroupRecord[], pageIndex: number) => {
  if (isEmpty(list)) {
    if (pageIndex == 1) {
      groupData.value = {};
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
    result = groupData.value;
  }
  list.forEach(item => {
    const date = item.startTime ? DayJS(item.startTime).format('YYYY-MM-DD') : '';
    if (date in result) {
      result[date].push(item);
    } else {
      result[date] = [item];
    }
  });
  groupData.value = result;
};

const loadPageData = async (pageIndex: number) => {
  try {
    const params = {
      pageNum: pageIndex,
      pageSize,
      sourceId: groupId.value,
      ...(controlWay.value != 0 ? { controlWay: controlWay.value } : { controlWays: [CTRL_WAY.Group, CTRL_WAY.Lock] }),
    };
    proxy.$publicFunc.showLoading('加载中...');
    const res: any = await loadMemberLog(params);
    proxy.$publicFunc.hideLoading();
    pushPageData(res?.result || [], pageIndex);
  } catch (error) {
    console.log('error: ', error);
    proxy.$publicFunc.hideLoading();
  }
};

onLoad((option: any) => {
  groupId.value = option.id;
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

const onRecordClick = (data: TGroupRecord) => {
  uni.navigateTo({
    url: `/app-intelligent-iot/air-condition-manager/record/group-detail?id=${data.id}`,
  });
}

const onSelect = (e: TOption[]) => {
  const [target] = e;
  controlWay.value = target?.value;
  selectIndex.value = target?.index || 0;
  loadPageData(1);
}
</script>

<template>
  <u-sticky>
    <view class="header">
      <text @click="isPickerShow = true">{{ controlWayDesc }}</text>
      <u-icon name="arrow-down-fill" color="#00000073" top="2" size="20" @click="isPickerShow = true"></u-icon>
    </view>
  </u-sticky>
  <scroll-view
    :scroll-y="true"
    class="container"
    refresher-background="transparent"
    refresher-enabled="true"
    :refresher-triggered="refreshState"
    @refresherrefresh="onRefresh"
    @scrolltolower="onScrollBottom"
  >
    <date-list is-group :lock-data="groupData.value" @onItemClick="onRecordClick"/>
  </scroll-view>
  <u-select
    v-model="isPickerShow"
    :default-value="[selectIndex]"
    :list="options"
    @confirm="onSelect"
  ></u-select>
</template>

<style lang="scss" scoped>
.header {
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.88);
  background-color: #fff;
}
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