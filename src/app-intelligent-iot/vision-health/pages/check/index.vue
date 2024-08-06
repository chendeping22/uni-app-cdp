<template>
  <view class="">
    <view v-if="pageData.pageList && pageData.pageList.length" class="zy-margin">
      <view
        v-for="(item, index) in pageData.pageList"
        :key="index"
        class="check-item zy-shadow"
        @click="openPopup(item)"
      >
        <view :class="['zy-text-ellipsis', { 'text-color5': item.status == '2' }]">
          <!-- {{item.semester}}学年 -->
          {{ item.name }}
        </view>
        <view class="zy-flex zy-flex-row-between zy-margin-top-sm zy-margin-bottom-sm">
          <view :class="['zy-tag zy-tag--primary', { 'zy-tag--default': item.status == '2' }]">
            <zy-icons type="my" :size="28"></zy-icons>
            {{ item.screenTotal || 0 }}人
          </view>
          <view class="">
            <view v-if="item.status == '0'" class="check-item--tag"> 进行中 </view>
            <view v-else-if="item.status == '1'" class="check-item--tag tag-type-start">
              未开始
            </view>
            <view v-else-if="item.status == '2'" class="check-item--tag tag-type-end">
              已结束
            </view>
          </view>
        </view>
        <view :class="['text-size24 text-color4', { 'text-color5': item.status == '2' }]">
          <zy-icons type="time"></zy-icons>
          {{ item.startDate }} ~ {{ item.endDate }}
        </view>
      </view>
      <!-- 日常检测 -->
      <!-- #ifdef APP | H5 -->
      <view class="daily-check" @click="goDailyCheck">
        <c-icon name="icon_add" :size="58"></c-icon>
        <text class="daily-check-text">日常检测</text>
      </view>
      <!-- #endif -->
      <uni-load-more :status="pageData.loadingStatus"></uni-load-more>
    </view>
    <!-- 空数据 -->
    <zy-empty v-else></zy-empty>
    <!-- 弹窗 -->
    <zy-select-popup
      ref="popupRef"
      :is-active="false"
      title="选择检测项目"
      :list="pageData.selectList"
      @change="checkChange"
    />
  </view>
</template>

<script lang="ts" setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onReachBottom, onReady } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';

// import { checkAndChangeLocation } from '@/utils/change-location';
const userInfo = loginStore().userInfo;

const popupRef = ref(null);
const { proxy } = getPublicFuncProxy();
const store = useStore();
// 初始化页面数据
const pageData = reactive({
  pageList: [], // 列表数据
  selectList: [],
  queryForm: {
    userId: '',
    pageNo: 1,
    pageSize: 10,
  },
  loadingStatus: 'more', // loading的状态 more/loading/noMore
});

// 获取列表
const getPageList = () => {
  if (pageData.loadingStatus != 'more') return;
  pageData.loadingStatus = 'loading';
  if (pageData.queryForm.pageNo == 1) {
    proxy.$publicFunc.showLoading();
  }
  $http.check
    .getWorkList(pageData.queryForm)
    .then(res => {
      pageData.pageList.push.apply(pageData.pageList, res.records);
      const noMore = pageData.queryForm.pageNo * pageData.queryForm.pageSize >= res.total;
      pageData.loadingStatus = noMore ? 'noMore' : 'more';
      pageData.queryForm.pageNo++;
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
      pageData.loadingStatus = 'more';
      uni.stopPullDownRefresh();
    });
};
// 打开弹窗
const openPopup = data => {
  if (data.status == '1') {
    proxy.$publicFunc.showToast('none', '检测工作未开始');
    return;
  }
  store.commit('UPDATE_WORKINFO', data);
  store.commit('UPDATE_SCREENTYPE', data.screenType);

  let dataList = [];
  if (data.screenWorkItemList) {
    data.screenWorkItemList.map(item => {
      dataList.push({
        name: item.itemName,
        value: item.itemCode,
      });
    });
  }

  pageData.selectList = dataList;

  popupRef.value.openPopup();
};
// 检查项目选择
const checkChange = e => {
  // type 0 视力 1 屈光 -1眼轴
  store.commit('UPDATE_CHECKTYPE', e.value);
  store.commit('UPDATE_CHECKNAME', e.name);

  // 设置不为日常检测
  store.commit('UPDATE_IS_DAILY', false);

  let pageUrl = `/app-intelligent-iot/vision-health/pages/check/refraction/index?type=${e.value}`;
  uni.navigateTo({
    url: pageUrl,
  });
};

// 跳转日常检测
const goDailyCheck = () => {
  store.commit('UPDATE_IS_DAILY', true);

  // 重置检测工作store
  store.commit('UPDATE_WORKINFO', null);
  store.commit('UPDATE_SCREENTYPE', 1); // 组织
  store.commit('UPDATE_CHECKTYPE', 1); // 屈光
  store.commit('UPDATE_CHECKNAME', null);

  let pageUrl = `/app-intelligent-iot/vision-health/pages/check/refraction/index?type=${1}`;
  uni.navigateTo({
    url: pageUrl,
  });
};

const redirectTo = info => {
  uni.setNavigationBarTitle({
    title: info.locationName,
  });
  pageData.queryForm.userId = info.id;
  getPageList();
};
onLoad(option => {
  //参数有locationId说明公众号跳转过来的
  // if (option?.locationId) {
  //   //切换对应的组织
  //   checkAndChangeLocation(option?.locationId, redirectTo);
  // } else {
  pageData.queryForm.userId = userInfo.id;
  getPageList();
  // }
});
onReady(() => {
  uni.setNavigationBarTitle({
    title: userInfo.locationName,
  });
});
// 下拉刷新
onPullDownRefresh(() => {
  pageData.queryForm.pageNo = 1;
  pageData.pageList = [];
  pageData.loadingStatus = 'more';
  getPageList();
});
// 上拉加载
onReachBottom(() => {
  getPageList();
});
</script>

<style lang="scss" scoped>
.check-item {
  border-radius: 12rpx;
  background: $zy-middle-color2;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;

  &--tag {
    border-radius: 12rpx;
    color: $zy-middle-color2;
    font-size: $zy-font-size28;
    background: rgba($color: $zy-main-color, $alpha: 0.8);
    padding: 4rpx 16rpx;
  }

  .tag-type-start {
    background: $zy-spare-color4;
  }

  .tag-type-end {
    background: $zy-middle-color7;
    color: $zy-middle-color5;
  }
}

.daily-check {
  position: fixed;
  z-index: 99;
  bottom: 100rpx;
  right: 32rpx;
  background: $uni-bg-color;
  color: $ui-color-primary;
  padding: 12rpx;
  border: 1px solid rgba(229, 230, 236, 1);
  box-shadow: 0px 0px 20px 0px rgba(29, 33, 41, 0.05);
  border-radius: 12px;
  width: 152rpx;
  height: 152rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .daily-check-text {
    font-weight: 500;
  }
}
</style>
