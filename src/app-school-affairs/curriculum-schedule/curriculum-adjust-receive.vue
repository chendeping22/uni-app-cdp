<template>
  <view class="h100">
    <AdjustSearch :value="searchParams" @change="handleSearchParamsChange" />
    <view class="scroll-wrapper">
      <c-refresh-scroll
        ref="refreshScrollRef"
        show-no-more-tip
        auto-mount
        :page-size="10"
        :custom-height="'100%'"
        :fetch-data-func="fetchData"
      >
        <view v-if="list.length > 0" class="mb-l">
          <template v-for="(item, index) in list" :key="item.id">
            <u-gap v-if="index > 0" height="24"></u-gap>
            <AdjustItem :data="item" />
          </template>
        </view>
        <view v-if="!loading && list.length === 0" class="empty-wrapper flex-center">
          <u-empty-custom mode="search" :margin-top="0" text="暂无数据" />
        </view>
      </c-refresh-scroll>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { getAdjustList } from '../services/curriculum-adjust';
import AdjustItem from './components/adjust-item.vue';
import AdjustSearch from './components/adjust-search.vue';

const searchParams = ref<any>({
  keyword: '',
  type: '',
  startTime: undefined,
  endTime: undefined,
  status: undefined,
});

const loading = ref(false);
const list = ref<any[]>([]);
const refreshScrollRef = ref(null as any);

async function fetchData(pager: any, type: any) {
  const { pageNum } = pager;
  loading.value = true;
  const res: any = await getAdjustList({
    pageSize: 10,
    pageNum,
    direction: 2,
    keyword: searchParams.value.keyword || '',
    type: searchParams.value.type || '',
    startTime: searchParams.value.startTime || '',
    endTime: searchParams.value.endTime || '',
    status: searchParams.value.status || '',
  });
  loading.value = false;
  if (type === 'append') {
    list.value = [...list.value, ...(res?.result || [])];
  } else {
    uni.$emit('UPDATE_RECEIVE_ADJUST_COUNT');
    list.value = res?.result || [];
  }
  return { total: res?.total || 0 };
}

function handleSearchParamsChange(params: any) {
  searchParams.value = params;
  refreshScrollRef.value.initData();
}

function handleUpdate() {
  list.value = [];
  refreshScrollRef.value.initData();
}

onBeforeMount(() => {
  uni.$on('UPDATE_RECEIVE_ADJUST_LIST', handleUpdate);
});

onBeforeUnmount(() => {
  uni.$off('UPDATE_RECEIVE_ADJUST_LIST', handleUpdate);
});
</script>

<style lang="scss" scoped>
.scroll-wrapper {
  height: calc(100% - 212rpx);
}
.empty-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
