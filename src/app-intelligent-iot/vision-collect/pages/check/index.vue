<template>
  <view class="">
    <view v-if="pageData.pageList && pageData.pageList.length" class="zy-margin">
      <view
        v-for="(item, index) in pageData.pageList"
        :key="index"
        class="check-item zy-shadow"
        @click="openPopup(item)"
      >
        <view :class="['zy-text-ellipsis marginBt', { 'text-color5': item.chkGoingStatus == '2' }]">
          {{ item.chkThreadTitle }}
        </view>
        <view class="floatRt zy-margin-top-sm zy-margin-bottom-sm">
          <view class="">
            <view v-if="item.chkGoingStatus == '1'" class="check-item--tag"> 进行中 </view>
            <view v-else-if="item.chkGoingStatus == '0'" class="check-item--tag tag-type-start">
              未开始
            </view>
            <view v-else-if="item.chkGoingStatus == '2'" class="check-item--tag tag-type-end">
              已结束
            </view>
          </view>
        </view>
        <view :class="['text-size24 text-color4', { 'text-color5': item.chkGoingStatus == '2' }]">
          <zy-icons type="time"></zy-icons>
          {{ formatDate(item.chkPlanstartTime) }} ~ {{ formatDate(item.chkPlanendTime) }}
        </view>
      </view>
      <uni-load-more :status="pageData.loadingStatus"></uni-load-more>
    </view>
    <!-- 空数据 -->
    <zy-empty v-else></zy-empty>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-collect/api';
import { formatDate } from '@/app-intelligent-iot/vision-collect/utils/formatDate';
import { loginEvent } from '@/app-intelligent-iot/vision-collect/utils/loginEvent';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const userInfo = loginStore().userInfo;

const { proxy } = getPublicFuncProxy();
const store = useStore();
// 初始化页面数据
const pageData = reactive({
  pageList: [], // 列表数据
  queryForm: {
    // userId: '',
    pageNum: 1,
    pageSize: 10,
  },
  loadingStatus: 'more', // loading的状态 more/loading/noMore
});

// 获取列表
const getPageList = () => {
  if (pageData.loadingStatus != 'more') return;
  pageData.loadingStatus = 'loading';
  if (pageData.queryForm.pageNum == 1) {
    proxy.$publicFunc.showLoading();
  }
  $http.kangRui
    .findWorkPage(pageData.queryForm)
    .then(res => {
      console.log('检测工作列表====', res);
      pageData.pageList.push.apply(pageData.pageList, res.pAGE.list);
      const noMore =
        pageData.queryForm.pageNum * pageData.queryForm.pageSize >= res.pAGE.totalCount;
      pageData.loadingStatus = noMore ? 'noMore' : 'more';
      pageData.queryForm.pageNum++;
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
      pageData.loadingStatus = 'more';
      uni.stopPullDownRefresh();
      loginEvent(userInfo.tel);
    });
};
// 打开弹窗
const openPopup = data => {
  if (data.chkGoingStatus == '0') {
    proxy.$publicFunc.showToast('none', '检测工作未开始');
    return;
  }
  store.commit('UPDATE_WORKINFO_VC', data);
  // store.commit('UPDATE_SCREENTYPE', data.screenType);
  let pageUrl = `/app-intelligent-iot/vision-collect/pages/check/refraction/index?type=0`;
  uni.navigateTo({
    url: pageUrl,
  });
};

const redirectTo = info => {
  uni.setNavigationBarTitle({
    title: info.locationName,
  });
  // pageData.queryForm.userId = info.id;
  getPageList();
};
onLoad(option => {
  //参数有locationId说明公众号跳转过来的
  // if (option?.locationId) {
  //   //切换对应的组织
  //   checkAndChangeLocation(option?.locationId, redirectTo);
  // } else {
  // pageData.queryForm.userId = userInfo.id;
  getPageList();
  // }
});
// 下拉刷新
onPullDownRefresh(() => {
  pageData.queryForm.pageNum = 1;
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
    width: 120rpx;
    height: 48rpx;
  }

  .tag-type-start {
    background: $zy-spare-color4;
  }

  .tag-type-end {
    background: $zy-middle-color7;
    color: $zy-middle-color5;
  }
}
.floatRt {
  float: right;
  margin-top: -25rpx;
}
.marginBt {
  margin-bottom: 20rpx;
}
</style>
