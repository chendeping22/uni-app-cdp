<template>
  <page title="智能填报列表页面">
    <c-refresh-scroll
      ref="refreshScrollRef"
      :fetch-data-func="fetchDataFunc"
      :empty-line="100"
      :page-size="20"
      :auto-mount="true"
    >
      <!-- 头部搜索 -->
      <template #top_area>
        <view class="bg-white">
          <view style="padding: 0 20rpx">
            <u-search
              v-model="name"
              placeholder="请输入分发对象"
              height="72"
              :show-action="false"
              bg-color="#f0f2f6"
              shape="square"
              @change="search"
            >
            </u-search>
          </view>
          <view>
            <u-tabs v-model="current" :list="list" :is-scroll="false" @change="change"></u-tabs>
          </view>
        </view>
      </template>
      <!-- 列表 -->
      <view v-if="tasks.length != 0" class="bg">
        <view v-if="current === 0">
          <List :list="tasks" :type="0" :delay-time="delayTime" :report-id="reportId" />
        </view>
        <view v-else-if="current === 1">
          <List :list="tasks" :type="1" :delay-time="delayTime" :report-id="reportId" />
        </view>
      </view>
      <view v-else style="padding-top: 100rpx">
        <u-empty-custom></u-empty-custom>
      </view>
    </c-refresh-scroll>
    <floating-actions :actions="getActions" @actionClick="handleActionClick" />
    <dispatch
      v-if="flowBeforeId && reportId"
      v-model="showDispatch"
      :flow-before-id="flowBeforeId"
      :fill-report-id="reportId"
      @dispatchSuccess="dispatchSuccess"
    />
  </page>
</template>

<script lang="ts" setup>
import {
  batchUrgeHandle,
  dispatchPageDetail,
  getFillReportInfo,
} from '@/app-school-affairs/services/fill-report';
import { showInfo } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';
import cRefreshScroll from '../../components/c-refresh-scroll.vue';
import iconDispatch from '../../static/dispatch.svg';
import iconPress from '../../static/press.svg';
import Dispatch from '../components/dispatch.vue';
import FloatingActions from '../components/floating-actions.vue';
import List from './components/list.vue';
const list = ref([
  {
    name: '未报（0）',
  },
  {
    name: '已报（0）',
  },
]);
const showDispatch = ref(false);
const getActions = computed(() => {
  const actionDispatch = { key: 'dispatch', image: iconDispatch, title: '分发' };
  const actionpress = { key: 'press', image: iconPress, title: '一键催办' };
  const res: any[] = [];
  if (!fillInfo.value || fillInfo.value.currentFinish) {
    return res;
  }

  res.push(actionDispatch);
  if (current.value == 0) {
    res.push(actionpress);
  }

  return res;
});
const refreshScrollRef = ref();
const reportId = ref();
const flowBeforeId = ref();
const delayTime = ref<number>();
const current = ref(0);
const initPages = {
  pageNum: 1,
  pageSize: 20,
  total: 0,
};

const name = ref('');
const fillInfo = ref();
const tasks = ref<any>([]);
const totalMap = ref();
const uncommittedCount = ref();

const change = (index: any) => {
  tasks.value = [];
  current.value = index;
  fetchDataFunc(initPages, 'new');
};
const dispatchSuccess = () => {
  refreshScrollRef.value.initData();
};
const fetchDataFunc = async (pager: any, type: string) => {
  const { pageSize, pageNum } = pager;
  const data = {
    currentPage: pageNum,
    pageSize,
    ...{
      name: name.value,
      dispatchStatus: current.value,
      flowBeforeId: flowBeforeId.value,
      reportId: reportId.value,
    },
  };

  const res: any = await dispatchPageDetail(data);
  uncommittedCount.value = res.uncommittedCount;
  list.value[0].name = `未报(${res.uncommittedCount})`;
  list.value[1].name = `已报(${res.committedCount})`;
  type === 'new' && (tasks.value = []);
  tasks.value.push(...res.items);
  totalMap.value = res.pagination.total;
  return res;
};
const search = () => {
  refreshScrollRef.value.initData();
};
function handleActionClick({ key }: any) {
  if (key === 'dispatch') {
    showDispatch.value = true;
  } else if (key === 'press') {
    if (uncommittedCount.value == 0) {
      showInfo('无催办数据');
      return;
    }
    // 调用接口
    const data = {
      flowBeforeId: flowBeforeId.value,
      reportId: reportId.value,
      fromType: 1,
    };
    batchUrgeHandle(data).then(() => {
      showInfo('已提醒用户尽快填报');
    });
  }
}
onLoad((option: any) => {
  reportId.value = option.reportId;
  flowBeforeId.value = option.flowBeforeId;
  delayTime.value = isNaN(option.delayTime) ? undefined : +option.delayTime;
  getFillReportInfo(option.reportId, option.flowBeforeId).then(res => {
    fillInfo.value = res;
  });
});
</script>
<style lang="scss" scoped>
.bg-white {
  background: #fff;
}
.flex-style {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.box-bg {
  background: #ebf3ff;
  padding: 20rpx;
  height: 100%;
  min-height: 88vh;
}
.bg {
  padding: 4rpx 32rpx;
}
</style>
