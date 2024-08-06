<script setup lang="ts">
import {
  getLocationAssetCount,
  getOrdinaryList,
  getPermissionInfo,
  getUserAssetCount,
} from '@/app-general-affairs-logistics/services/assets-manage';

import approval from '@/app-general-affairs-logistics/static/assets-manage/approval.svg';
import back from '@/app-general-affairs-logistics/static/assets-manage/back.svg';
import borrow from '@/app-general-affairs-logistics/static/assets-manage/borrow.svg';
import collection from '@/app-general-affairs-logistics/static/assets-manage/collection.svg';
import dispose from '@/app-general-affairs-logistics/static/assets-manage/dispose.svg';
import down from '@/app-general-affairs-logistics/static/assets-manage/down.svg';
import inventory from '@/app-general-affairs-logistics/static/assets-manage/inventory.svg';
import library from '@/app-general-affairs-logistics/static/assets-manage/library.svg';
import printIcon from '@/app-general-affairs-logistics/static/assets-manage/print_blue.svg';
import purchase from '@/app-general-affairs-logistics/static/assets-manage/purchase.svg';
import putIn from '@/app-general-affairs-logistics/static/assets-manage/put-in.svg';
import ret from '@/app-general-affairs-logistics/static/assets-manage/return.svg';
import scan from '@/app-general-affairs-logistics/static/assets-manage/scan.svg';
import up from '@/app-general-affairs-logistics/static/assets-manage/up.svg';
import defaultFile from '@/app-general-affairs-logistics/static/assets-manage/upload-file-item.svg';
import variation from '@/app-general-affairs-logistics/static/assets-manage/variation.svg';
import wrench from '@/app-general-affairs-logistics/static/assets-manage/wrench.svg';
import { formatDate, formattedNum, hideLoading, showLoading } from '@/utils/tools';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { computed, onBeforeMount, ref } from 'vue';
import { useAdmin } from '../../store/useAdmin';
import { ScanTypeEnum, handleScan } from '../../utils/assets-scan';

interface userAssetModel {
  manageNumber: number;
  inUseNumber: number;
  borrowedNumber: number;
  underRepairNumber: number;
}
interface assetNumber {
  number: number;
  numberPercent: number;
  price: number;
  pricePercent: number;
}
interface locationAssetModel {
  totalNumber: number;
  totalPrice: number;
  idleDetails: assetNumber; // 闲置
  borrowedDetails: assetNumber; // 借用
  inUseDetails: assetNumber; // 在用
  disposedDetails: assetNumber; // 已处理
  underRepairDetails: assetNumber; // 维修中
  underReviewDetails: assetNumber; // 审批中
  beingTransferredDetails: assetNumber; // 调拨中
  scrappedDetails: assetNumber; // 已报废
}
const userAssetCount = ref<userAssetModel>({
  manageNumber: 0,
  inUseNumber: 0,
  borrowedNumber: 0,
  underRepairNumber: 0,
});
const locationAssetCount = ref<locationAssetModel>();
const ordinaryList = ref<any[]>([]);
const isAdminCheck = ref<boolean>(true);
const keyword = ref('');
const isNumber = ref<boolean>(true);
const loading = ref<boolean>(false);
const isAdminStore = useAdmin();
const showAll = ref<boolean>(false);
const navModelList = [
  {
    label: '资产库',
    icon: library,
    url: '/app-general-affairs-logistics/assets-manage/pages/wareroom/index',
  },
  {
    label: '入库单',
    icon: putIn,
    url: '/app-general-affairs-logistics/assets-manage/pages/approve/index?tab=8',
  },
  {
    label: '采购单',
    icon: purchase,
    url: '/app-general-affairs-logistics/assets-manage/pages/purchaseOrder/index',
  },
  {
    label: '单据审批',
    icon: approval,
    url: '/app-general-affairs-logistics/assets-manage/pages/approve/index',
  },
  {
    label: '资产领用',
    icon: collection,
    url: '/app-general-affairs-logistics/assets-manage/pages/receive/index?type=home',
  },
  {
    label: '资产退还',
    icon: ret,
    url: '/app-general-affairs-logistics/assets-manage/pages/sendBack/index?type=home',
  },
  {
    label: '资产借用',
    icon: borrow,
    url: '/app-general-affairs-logistics/assets-manage/pages/borrow/index?type=home',
  },
  {
    label: '资产归还',
    icon: back,
    url: '/app-general-affairs-logistics/assets-manage/pages/back/index?type=home',
  },
  {
    label: '资产报修',
    icon: wrench,
    url: '/app-general-affairs-logistics/assets-manage/pages/repair/index?type=home',
  },
  {
    label: '资产变更',
    icon: variation,
    url: '/app-general-affairs-logistics/assets-manage/pages/variation/index?type=home',
  },
  {
    label: '资产处置',
    icon: dispose,
    url: '/app-general-affairs-logistics/assets-manage/pages/dispose/index?type=home',
  },
  {
    label: '资产盘点',
    icon: inventory,
    url: '/app-general-affairs-logistics/assets-manage/pages/inventory/index?type=home',
  },
  {
    label: '资产打印',
    icon: printIcon,
    url: '/app-general-affairs-logistics/assets-manage/pages/print/select-assets',
  },
];

const navList = computed(() => {
  if (isAdminCheck.value) {
    return navModelList;
  } else {
    return [
      ...navModelList.slice(4, 9),
      ...navModelList.slice(3, 4),
      ...navModelList.slice(0, 1),
      ...navModelList.slice(11),
    ];
  }
});
const onChange = () => {
  if (!keyword.value) {
  }
};
const onSearch = () => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/wareroom/index?keyword=${
      keyword.value || ''
    }`,
  });
  keyword.value = '';
};
// 根据type 去跳转
const navigateTo = (url: string) => {
  uni.navigateTo({
    url,
  });
};
const selectItem = (item: Record<string, any>) => {
  uni.navigateTo({
    url: item?.url,
  });
};
// 获取用户资产统计
const getUserAsset = async () => {
  showLoading();
  try {
    userAssetCount.value = await getUserAssetCount();
  } finally {
    hideLoading();
  }
};
const init = async () => {
  loading.value = true;
  try {
    const { isAdmin }: any = await getPermissionInfo();
    isAdminCheck.value = isAdmin;
    isAdminStore.$set(isAdmin);
    if (isAdminCheck.value) {
      locationAssetCount.value = await getLocationAssetCount();
    } else {
      const { records } = await getOrdinaryList();
      ordinaryList.value = records;
    }
  } catch (e: any) {
  } finally {
    uni.stopPullDownRefresh();
    loading.value = false;
  }
};
const goToDetail = (item: any) => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/detail/index?id=${item.id}`,
  });
};

// 跳转资产库
const goToWareroom = (status: number, isOwner = false) => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/wareroom/index?status=${status}${
      isOwner ? '&isOwner=' + isOwner : ''
    }`,
  });
};
onBeforeMount(() => {
  getUserAsset();
  init();
});

onPullDownRefresh(() => {
  getUserAsset();
  init();
});
</script>
<template>
  <page custom-overflow="visible">
    <view class="search-content">
      <u-search
        v-model="keyword"
        shape="square"
        placeholder="搜索资产编号、资产名称"
        :clearabled="true"
        :show-action="false"
        height="76"
        color="#000000E0"
        search-icon-color="#00000073"
        placeholder-color="#00000073"
        @change="onChange"
        @search="onSearch"
      ></u-search>
      <u-image
        class="scan"
        :src="scan"
        width="40"
        height="40"
        :show-loading="false"
        :fade="false"
        @click="handleScan(ScanTypeEnum.ScanHome)"
      ></u-image>
    </view>
    <view class="main-wrap">
      <view class="head-list">
        <view
          class="head-item"
          @click="
            navigateTo(
              '/app-general-affairs-logistics/assets-manage/pages/wareroom/index?isOwner=1',
            )
          "
        >
          <view class="head-item-title">我的资产</view>
          <view class="head-item-content" style="color: #000000">{{
            userAssetCount.manageNumber
          }}</view>
        </view>
        <view
          class="head-item"
          @click="
            navigateTo(
              '/app-general-affairs-logistics/assets-manage/pages/wareroom/index?isOwner=1&status=1',
            )
          "
        >
          <view class="head-item-title">领用</view>
          <view class="head-item-content" style="color: #1677ff">{{
            userAssetCount.inUseNumber
          }}</view>
        </view>
        <view
          class="head-item"
          @click="
            navigateTo(
              '/app-general-affairs-logistics/assets-manage/pages/wareroom/index?isOwner=1&status=2',
            )
          "
        >
          <view class="head-item-title">借用</view>
          <view class="head-item-content" style="color: #1677ff">{{
            userAssetCount.borrowedNumber
          }}</view>
        </view>
        <view
          class="head-item"
          @click="
            navigateTo(
              '/app-general-affairs-logistics/assets-manage/pages/wareroom/index?isOwner=1&status=4',
            )
          "
        >
          <view class="head-item-title">报修</view>
          <view class="head-item-content" style="color: #faad14">{{
            userAssetCount.underRepairNumber
          }}</view>
        </view>
      </view>
      <view class="nav-wrap">
        <view class="nav-list">
          <view
            v-for="(item, index) in showAll ? navList : navList.slice(0, 8)"
            :key="index"
            class="nav-item u-p-t-32 u-p-b-32"
            @click="selectItem(item)"
          >
            <view class="img-box">
              <u-image
                :src="item.icon"
                width="48"
                height="48"
                :show-loading="false"
                :fade="false"
              ></u-image>
            </view>
            <view class="u-font-24 u-m-t-8">{{ item.label }}</view>
          </view>
          <view v-if="navList.length > 8" class="up-down" @click="showAll = !showAll">
            <u-image
              v-if="showAll"
              :src="up"
              width="40"
              height="40"
              :show-loading="false"
              :fade="false"
            ></u-image>
            <u-image
              v-else
              :src="down"
              width="40"
              height="40"
              :show-loading="false"
              :fade="false"
            ></u-image>
          </view>
        </view>
      </view>
      <view v-if="loading" style="text-align: center; padding: 32rpx"
        ><u-loading :show="loading"></u-loading
      ></view>
      <view v-if="isAdminCheck && locationAssetCount" class="list-wrap">
        <view class="list-head">
          <view class="list-title">资产概览</view>
          <view class="list-type" @click="isNumber = !isNumber">{{
            isNumber ? '按金额查看' : '按数量查看'
          }}</view>
        </view>
        <view class="list-top">
          <view class="list-top-wrap">
            <view class="list-top-head">
              <view v-if="isNumber" class="list-top-title">资产总数</view>
              <view v-else class="list-top-title">资产总金额</view>
              <view class="list-top-con"
                >{{
                  isNumber
                    ? locationAssetCount.totalNumber
                    : formattedNum(locationAssetCount.totalPrice)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <view
              v-if="isNumber ? locationAssetCount.totalNumber : locationAssetCount.totalPrice"
              class="list-chart-wrap"
            >
              <view
                v-if="
                  isNumber
                    ? locationAssetCount.idleDetails.numberPercent
                    : locationAssetCount.idleDetails.pricePercent
                "
                class="chart-item"
                :style="{
                  width: `${
                    isNumber
                      ? locationAssetCount.idleDetails.numberPercent
                      : locationAssetCount.idleDetails.pricePercent
                  }%`,
                  background: '#FAAD14',
                }"
              ></view>
              <view
                v-if="
                  isNumber
                    ? locationAssetCount.borrowedDetails.numberPercent
                    : locationAssetCount.borrowedDetails.pricePercent
                "
                class="chart-item"
                :style="{
                  width: `${
                    isNumber
                      ? locationAssetCount.borrowedDetails.numberPercent
                      : locationAssetCount.borrowedDetails.pricePercent
                  }%`,
                  background: '#1677FF',
                }"
              ></view>
              <view
                v-if="
                  isNumber
                    ? locationAssetCount.inUseDetails.numberPercent
                    : locationAssetCount.inUseDetails.pricePercent
                "
                class="chart-item"
                :style="{
                  width: `${
                    isNumber
                      ? locationAssetCount.inUseDetails.numberPercent
                      : locationAssetCount.inUseDetails.pricePercent
                  }%`,
                  background: '#52C41A',
                }"
              ></view>
              <view
                v-if="
                  isNumber
                    ? locationAssetCount.disposedDetails.numberPercent
                    : locationAssetCount.disposedDetails.pricePercent
                "
                class="chart-item"
                :style="{
                  width: `${
                    isNumber
                      ? locationAssetCount.disposedDetails.numberPercent
                      : locationAssetCount.disposedDetails.pricePercent
                  }%`,
                  background: 'rgba(0, 0, 0, 0.25)',
                }"
              ></view>
              <view
                v-if="
                  isNumber
                    ? locationAssetCount.underRepairDetails.numberPercent
                    : locationAssetCount.underRepairDetails.pricePercent
                "
                class="chart-item"
                :style="{
                  width: `${
                    isNumber
                      ? locationAssetCount.underRepairDetails.numberPercent
                      : locationAssetCount.underRepairDetails.pricePercent
                  }%`,
                  background: '#FF4D4F',
                }"
              ></view>
              <view
                v-if="
                  isNumber
                    ? locationAssetCount.underReviewDetails.numberPercent
                    : locationAssetCount.underReviewDetails.pricePercent
                "
                class="chart-item"
                :style="{
                  width: `${
                    isNumber
                      ? locationAssetCount.underReviewDetails.numberPercent
                      : locationAssetCount.underReviewDetails.pricePercent
                  }%`,
                  background: '#722ED1',
                }"
              ></view>
              <view
                v-if="
                  isNumber
                    ? locationAssetCount.scrappedDetails.numberPercent
                    : locationAssetCount.scrappedDetails.pricePercent
                "
                class="chart-item"
                :style="{
                  width: `${
                    isNumber
                      ? locationAssetCount.scrappedDetails.numberPercent
                      : locationAssetCount.scrappedDetails.pricePercent
                  }%`,
                  background: '#FADB14',
                }"
              ></view>
            </view>
          </view>
        </view>
        <view class="list-main">
          <view class="list-item" @click="goToWareroom(0)">
            <view class="item-con">
              <view class="item-con-left">
                <view
                  class="item-icon"
                  :style="{ borderColor: '#FAAD14', background: 'rgba(250, 173, 20, .1)' }"
                ></view>
                <view class="item-title">闲置资产</view>
                <view class="item-percent"
                  >({{
                    isNumber
                      ? locationAssetCount.idleDetails.numberPercent
                      : locationAssetCount.idleDetails.pricePercent
                  }}%)</view
                >
              </view>
              <view class="item-con-right"
                >{{
                  isNumber
                    ? locationAssetCount.idleDetails.number
                    : formattedNum(locationAssetCount.idleDetails.price)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <u-icon name="arrow-right" size="32" color="#00000073" style="margin-left: 8rpx" />
          </view>
          <view class="list-item" @click="goToWareroom(2)">
            <view class="item-con">
              <view class="item-con-left">
                <view
                  class="item-icon"
                  :style="{ borderColor: '#1677FF', background: 'rgba(22, 119, 255, .1)' }"
                ></view>
                <view class="item-title">借用资产</view>
                <view class="item-percent"
                  >({{
                    isNumber
                      ? locationAssetCount.borrowedDetails.numberPercent
                      : locationAssetCount.borrowedDetails.pricePercent
                  }}%)</view
                >
              </view>
              <view class="item-con-right"
                >{{
                  isNumber
                    ? locationAssetCount.borrowedDetails.number
                    : formattedNum(locationAssetCount.borrowedDetails.price)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <u-icon name="arrow-right" size="32" color="#00000073" style="margin-left: 8rpx" />
          </view>
          <view class="list-item" @click="goToWareroom(1)">
            <view class="item-con">
              <view class="item-con-left">
                <view
                  class="item-icon"
                  :style="{ borderColor: '#52C41A', background: 'rgba(82, 196, 26, .1)' }"
                ></view>
                <view class="item-title">在用资产</view>
                <view class="item-percent"
                  >({{
                    isNumber
                      ? locationAssetCount.inUseDetails.numberPercent
                      : locationAssetCount.inUseDetails.pricePercent
                  }}%)</view
                >
              </view>
              <view class="item-con-right"
                >{{
                  isNumber
                    ? locationAssetCount.inUseDetails.number
                    : formattedNum(locationAssetCount.inUseDetails.price)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <u-icon name="arrow-right" size="32" color="#00000073" style="margin-left: 8rpx" />
          </view>
          <view class="list-item" @click="goToWareroom(6)">
            <view class="item-con">
              <view class="item-con-left">
                <view
                  class="item-icon"
                  :style="{ borderColor: 'rgba(0, 0, 0, 0.25)', background: 'rgba(0, 0, 0, 0.1)' }"
                ></view>
                <view class="item-title">已处置资产</view>
                <view class="item-percent"
                  >({{
                    isNumber
                      ? locationAssetCount.disposedDetails.numberPercent
                      : locationAssetCount.disposedDetails.pricePercent
                  }}%)</view
                >
              </view>
              <view class="item-con-right"
                >{{
                  isNumber
                    ? locationAssetCount.disposedDetails.number
                    : formattedNum(locationAssetCount.disposedDetails.price)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <u-icon name="arrow-right" size="32" color="#00000073" style="margin-left: 8rpx" />
          </view>
          <view class="list-item" @click="goToWareroom(4)">
            <view class="item-con">
              <view class="item-con-left">
                <view
                  class="item-icon"
                  :style="{ borderColor: '#FF4D4F', background: 'rgba(255, 77, 79, .1)' }"
                ></view>
                <view class="item-title">维修中资产</view>
                <view class="item-percent"
                  >({{
                    isNumber
                      ? locationAssetCount.underRepairDetails.numberPercent
                      : locationAssetCount.underRepairDetails.pricePercent
                  }}%)</view
                >
              </view>
              <view class="item-con-right"
                >{{
                  isNumber
                    ? locationAssetCount.underRepairDetails.number
                    : formattedNum(locationAssetCount.underRepairDetails.price)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <u-icon name="arrow-right" size="32" color="#00000073" style="margin-left: 8rpx" />
          </view>
          <view class="list-item" @click="goToWareroom(3)">
            <view class="item-con">
              <view class="item-con-left">
                <view
                  class="item-icon"
                  :style="{ borderColor: '#722ED1', background: 'rgba(114, 46, 209, .1)' }"
                ></view>
                <view class="item-title">审批中资产</view>
                <view class="item-percent"
                  >({{
                    isNumber
                      ? locationAssetCount.underReviewDetails.numberPercent
                      : locationAssetCount.underReviewDetails.pricePercent
                  }}%)</view
                >
              </view>
              <view class="item-con-right"
                >{{
                  isNumber
                    ? locationAssetCount.underReviewDetails.number
                    : formattedNum(locationAssetCount.underReviewDetails.price)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <u-icon name="arrow-right" size="32" color="#00000073" style="margin-left: 8rpx" />
          </view>
          <view class="list-item" @click="goToWareroom(9)">
            <view class="item-con">
              <view class="item-con-left">
                <view
                  class="item-icon"
                  :style="{ borderColor: '#FADB14', background: 'rgba(250, 219, 20, .1)' }"
                ></view>
                <view class="item-title">待维修资产</view>
                <view class="item-percent"
                  >({{
                    isNumber
                      ? locationAssetCount.scrappedDetails.numberPercent
                      : locationAssetCount.scrappedDetails.pricePercent
                  }}%)</view
                >
              </view>
              <view class="item-con-right"
                >{{
                  isNumber
                    ? locationAssetCount.scrappedDetails.number
                    : formattedNum(locationAssetCount.scrappedDetails.price)
                }}{{ isNumber ? '条' : '元' }}</view
              >
            </view>
            <u-icon name="arrow-right" size="32" color="#00000073" style="margin-left: 8rpx" />
          </view>
        </view>
      </view>
      <view v-else class="ordinary-wrap">
        <template v-if="ordinaryList.length">
          <view
            v-for="item in ordinaryList"
            :key="item.id"
            class="ordinary-item"
            @click="goToDetail(item)"
          >
            <u-image
              width="96rpx"
              height="96rpx"
              border-radius="16rpx"
              :src="item.assetInfoImgVOList?.[0] ? item.assetInfoImgVOList[0].fileUrl : defaultFile"
            ></u-image>
            <view class="ordinary-item-right">
              <view class="ordinary-item-right-item" style="margin-bottom: 8rpx">
                <view class="ordinary-title">{{ item.assetName }}</view>
                <view>
                  <u-tag
                    :text="item.assetStatusShow"
                    mode="light"
                    bg-color="rgba(230, 244, 255, 1)"
                    color="rgba(22, 119, 255, 1)"
                    border-color="transparent"
                /></view>
              </view>
              <view class="ordinary-item-right-item">
                <view class="ordinary-code">{{ item.assetNo }}</view>
                <view class="time">
                  <view
                    ><u-icon
                      name="clock"
                      size="26"
                      color="#00000073"
                      style="margin-right: 16rpx"
                    ></u-icon
                  ></view>
                  <view>{{ formatDate(item.updateTime) }}</view>
                </view>
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
  </page>
</template>
<style lang="scss" scoped>
.search-content {
  padding: 0rpx 32rpx 16rpx 32rpx;
  background-color: white;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
  position: fixed;
  z-index: 2;
  width: 100%;
  :deep(.u-content) {
    border-radius: 16rpx !important;
    padding-right: 72rpx;
  }
  .scan {
    position: absolute;
    top: 20rpx;
    right: 60rpx;
    z-index: 2000;
  }
}
.main-wrap {
  padding: 116rpx 32rpx 24rpx 32rpx;
}
.head-list {
  // display: flex;
  background: #fff;
  // justify-content: space-between;
  padding: 24rpx 32rpx;
  // gap: 16px;
  align-self: stretch;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 32rpx;
}
.head-item {
  padding: 16rpx 0;
  height: 144rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  text-align: center;
  flex: 1;
}
.head-item-title {
  margin-bottom: 8rpx;
  color: rgba(0, 0, 0, 0.45);
  font-family: 'PingFang SC';
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
}
.head-item-content {
  color: rgba(0, 0, 0, 0.88);
  font-family: 'PingFang SC';
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: 34px;
}
.nav-wrap {
  margin-top: 24rpx;
}
.u-grid-item {
  background: transparent;
}
.nav-list {
  margin-top: 24rpx;
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
  .up-down {
    width: 100%;
    height: 56rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  text-align: center;
  height: 184rpx;
}
.img-box {
  margin-bottom: 16rpx;
  display: flex;
  width: 40px;
  height: 40px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  border-radius: 16rpx;
  background: #e6f4ff;
}
.list-wrap {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
}
.list-head {
  padding: 0 32rpx;
  height: 96rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-family: 'PingFang SC';
  .list-title {
    color: #000000;
    font-size: 32rpx;
  }
  .list-type {
    color: #1677ff;
    font-size: 30rpx;
  }
}
.list-top {
  padding: 0 24rpx;
  .list-top-wrap {
    display: flex;
    padding: 32rpx;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24rpx;
    align-self: stretch;
    border-radius: 16rpx;
    background: linear-gradient(180deg, #f5f5f5 0%, #f5f5f500 100%);
    .list-top-head {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 30rpx;
      line-height: 20px;
    }
    .list-chart-wrap {
      width: 100%;
      background: #fff;
      height: 32rpx;
      display: flex;
      gap: 2rpx;
      border-radius: 10rpx;
      overflow: hidden;
    }
  }
}
.list-main {
  padding: 0 32rpx;
}
.list-item {
  position: relative;
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  .item-con {
    flex: 1;
    display: flex;
    justify-content: space-between;
    .item-con-left {
      display: flex;
      align-items: center;
      .item-icon {
        margin-right: 16rpx;
        width: 16rpx;
        height: 40rpx;
        border-radius: 8rpx;
        border: 1px solid #faad14;
        background: rgba(250, 219, 20, 0.1);
      }
      .item-title {
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        color: rgba(0, 0, 0, 0.88);
        text-overflow: ellipsis;
        font-family: 'PingFang SC';
        font-size: 30rpx;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
      }
      .item-percent {
        color: rgba(0, 0, 0, 0.45);
        font-size: 24rpx;
      }
    }
    .item-con-right {
      color: rgba(0, 0, 0, 0.45);
      text-align: right;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }
  }
  &::after {
    position: absolute;
    content: '';
    display: block;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1rpx;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.06);
  }
}
.ordinary-wrap {
  padding: 24rpx 0;
}
.ordinary-item {
  margin-bottom: 24rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
  .ordinary-item-right {
    flex: 1;
  }
}
.ordinary-item-right-item {
  margin-left: 32rpx;
  display: flex;
  gap: 24rpx;
  justify-content: space-between;
  .time {
    display: flex;
  }
}
.ordinary-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  flex: 1 0 0;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.88);
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 32rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 44rpx;
}
.ordinary-code {
  flex: 1 0 0;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 30rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 40rpx;
}
.time {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.45);
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 30rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 40rpx;
}
</style>
