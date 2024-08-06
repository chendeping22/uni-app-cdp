<template>
  <page custom-overflow="visible">
    <view class="approve-page">
      <view class="approve-header">
        <u-tabs
          v-model="currentTab"
          :list="tabList"
          inactive-color="rgba(0, 0, 0, 0.65)"
          class="approve-tabs"
          @change="changeTab"
        ></u-tabs>
      </view>
      <view class="approve-header-placeholder"></view>
      <view class="approve-content">
        <view v-if="state.listData?.length" class="approve-list">
          <view v-for="(item, index) in state.listData" :key="item.id" class="list-card">
            <u-card :border="false" :show-head="false" :show-foot="false" @click="goDetail(item)"
              ><template #body>
                <view class="list-card-name">
                  {{ item.name }}
                </view>
                <view class="list-card-item">
                  <view class="list-card-label">创建时间</view>
                  <view>{{
                    item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm') : '/'
                  }}</view>
                </view>
                <view class="list-card-item" v-if="endTimeTitle">
                  <view class="list-card-label">{{ endTimeTitle }}</view>
                  <view>{{
                    item.updateTime ? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm') : '/'
                  }}</view>
                </view>
                <view class="list-card-item">
                  <view class="list-card-label">盘点总数</view>
                  <view>{{ item?.assetNum || 0 }}</view>
                </view>
                <view class="list-card-item">
                  <view class="list-card-type" style="margin-right: 16rpx">
                    <view class="list-card-type-title">未盘</view>
                    <view class="list-card-type-num">{{ item?.noInventory || 0 }}</view>
                  </view>
                  <view class="list-card-type" style="margin-right: 16rpx">
                    <view class="list-card-type-title">已盘</view>
                    <view class="list-card-type-num">{{ item?.inventoried || 0 }}</view>
                  </view>
                  <view class="list-card-type">
                    <view class="list-card-type-title">盘盈</view>
                    <view class="list-card-type-num">{{ item?.inventoryProfitExist || 0 }}</view>
                  </view>
                </view>
              </template>
            </u-card>
          </view>
          <u-loadmore :status="state.pageStatus" margin-bottom="32" @loadmore="loadmore" />
        </view>
        <view v-else class="approve-empty">
          <u-empty-custom v-if="isEmpty" mode="list"></u-empty-custom>
        </view>
      </view>
    </view>
  </page>
</template>

<script setup lang="ts">
import { showInfo } from '@/utils/tools';
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, reactive, ref } from 'vue';
import { getAssetInventoryPage, getAssetInventoryStatistic } from '../../services/inventory';

const tabList = ref<any[]>([]);

const currentTab = ref(0);

const endTimeTitle = computed(() => {
  let name = '';
  switch (currentTab.value) {
    case 2: //已完成
      name = '完成时间';
      break;
    case 3: //已驳回
      name = '驳回时间';
      break;
    case 4: //已取消
      name = '取消时间';
      break;
    default:
      break;
  }
  return name;
});

onShow(() => {
  currentTab.value = 0;
  state.currentPage = 1;
  tabList.value = [];
  getTabList();
  getPageList();
});

const state = reactive<{
  listData: Record<string, any>[];
  currentPage: number;
  total: number;
  pageStatus: string;
  recordId: string;
}>({
  listData: [],
  currentPage: 1,
  total: 0,
  pageStatus: 'loadmore',
  recordId: '',
});

const isEmpty = computed(
  () => state.pageStatus !== 'loading' && state.currentPage === 1 && state.listData?.length === 0,
);
const getTabList = async () => {
  try {
    const { processNum, approveNum, finishNum, rejectNum, cancelNum } =
      await getAssetInventoryStatistic();
    tabList.value = [
      { name: `进行中(${processNum})` },
      { name: `审批中(${approveNum})` },
      { name: `已完成(${finishNum})` },
      { name: `已驳回(${rejectNum})` },
      { name: `已取消(${cancelNum})` },
    ];
  } catch (e: any) {
    showInfo(e?.msg || '查询失败');
  }
};
/** 列表查询 */
const getPageList = async () => {
  try {
    state.pageStatus = 'loading';
    const params: any = {
      pageSize: 15,
      pageNum: state.currentPage,
      approveStatusList: [currentTab.value === 4 ? 5 : currentTab.value],
    };
    const res: any = await getAssetInventoryPage(params);
    if (state.currentPage === 1) {
      state.listData = res?.records || [];
    } else {
      state.listData = state.listData.concat(res?.records || []);
    }
    state.total = res?.total ?? 0;
  } catch (e: any) {
    showInfo(e?.msg || '查询失败');
    state.listData = [];
  } finally {
    state.pageStatus = state.listData.length >= state.total ? 'nomore' : 'loadmore';
    uni.stopPullDownRefresh();
  }
};
const goDetail = (item: any) => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/inventory/detail/index?assetInventoryId=${item.assetInventoryId}&taskId=${item.id}`,
  });
};
const changeTab = (index: number) => {
  state.listData = [];
  currentTab.value = index;
  getPageList();
};

const loadmore = () => {
  if (state.pageStatus === 'loadmore') {
    state.currentPage = state.currentPage + 1;
    getTabList();
    getPageList();
  }
};

onReachBottom(() => {
  loadmore();
});

/** 下拉刷新 */
onPullDownRefresh(() => {
  state.currentPage = 1;
  getTabList();
  getPageList();
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.approve-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.approve-header {
  background-color: $colorWhite;
  box-shadow: $boxShadow;
  position: fixed;
  height: 96rpx;
  width: 100%;
  z-index: 2;
  &-placeholder {
    padding-top: 100rpx;
  }
}
.approve-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}
.approve-empty {
  flex: 1;
}

.list-card {
  :deep(.u-card) {
    border-radius: 16rpx;
  }

  &-name {
    margin-bottom: 24rpx;
    color: $textDefaultColor;
    font-size: 32rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &-item {
    margin-bottom: 24rpx;
    display: flex;
    font-size: 30rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-label {
    min-width: 120rpx;
    color: $textLabelColor;
    margin-right: 24rpx;
  }
  &-type {
    flex: 1;
    border-radius: 16rpx;
    padding: 16rpx;
    background: rgba(0, 0, 0, 0.04);
    text-align: center;
    &-title {
      color: rgba(0, 0, 0, 0.45);
      line-height: 36rpx;
      font-size: 26rpx;
      margin-bottom: 4rpx;
    }
    &-num {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 52rpx;
      font-size: 40rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
