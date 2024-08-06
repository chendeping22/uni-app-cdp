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
              placeholder="搜索"
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
      <view v-if="tasks && tasks.length !== 0" class="bg">
        <view v-if="current == 0"><toBeCompleted :list="tasks" :type="current" /></view>
        <view v-else-if="current == 1"><toBeCompleted :list="tasks" :type="current" /></view>
        <view v-else><myCreated :list="tasks" /></view>
      </view>
      <view v-else-if="tasks && tasks.length === 0" style="padding-top: 100rpx">
        <u-empty-custom mode="search" text="暂无数据"></u-empty-custom>
      </view>
    </c-refresh-scroll>
  </page>
</template>

<script lang="ts" setup>
import { baseFillReportsList, pageDoFillReport } from '@/app-school-affairs/services/fill-report';
import { onLoad } from '@dcloudio/uni-app';
import { nextTick, ref } from 'vue';
import cRefreshScroll from '../../components/c-refresh-scroll.vue';
import myCreated from './components/myCreated.vue';
import toBeCompleted from './components/toBeCompleted.vue';

const refreshScrollRef = ref();
const list = ref([
  {
    name: '待填报',
  },
  {
    name: '已填报',
  },
  {
    name: '我创建的',
  },
]);
const current = ref(0);
const initPages = {
  pageNum: 1,
  pageSize: 20,
  total: 0,
};

const name = ref('');
const tasks = ref<any>(null);

const change = (index: any) => {
  current.value = index;
  fetchDataFunc(initPages, 'new');
};
const fetchDataFunc = async (pager: any, type: string) => {
  type === 'new' && (tasks.value = null);
  uni.showLoading({
    title: '加载中',
  });
  let res: any;
  const { pageSize, pageNum } = pager;

  if (current.value == 0 || current.value == 1) {
    const data = {
      currentPage: pageNum,
      pageSize,
      ...{
        name: name.value,
        status: current.value,
      },
    };
    res = await pageDoFillReport(data);
  } else {
    const data = {
      currentPage: pageNum,
      pageSize,
      ...{
        keyword: name.value,
        status: current.value,
      },
    };
    res = await baseFillReportsList(data);
  }
  uni.hideLoading();
  nextTick(() => {
    if (!tasks.value) {
      tasks.value = [];
    }
    tasks.value.push(...res.list);
  });
  return res;
};
const search = () => {
  refreshScrollRef.value.initData();
};

onLoad((option: any) => {
  current.value = option.type;
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
