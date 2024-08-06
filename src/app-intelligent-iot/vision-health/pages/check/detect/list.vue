<template>
  <!-- 搜索框 -->
  <view class="search-box">
    <uni-search-bar
      v-model="pageData.queryForm.name"
      cancel-button="none"
      placeholder="搜索"
      maxlength="20"
      @confirm="onSearch"
      @clear="searchClear"
    >
    </uni-search-bar>
  </view>
  <block v-if="pageData.pageList && pageData.pageList.length">
    <view class="zy-tips zy-flex zy-flex-col-center" style="margin-top: 130rpx">
      <text>注:</text>
      <zy-icons type="annotation" class="zy-tips--icon"></zy-icons>
      <text>可能存在误操作情况，建议重新采集</text>
    </view>
    <view class="zy-margin">
      <view
        v-for="(item, index) in pageData.pageList"
        :key="index"
        class="item-card zy-shadow zy-flex zy-flex-row-between zy-flex-col-center"
        @click="toDetail(item)"
      >
        <view class="">
          <view class="zy-margin-bottom-sm">
            <text>{{ item.name }}</text>
            <text class="text-color4 text-size24 zy-margin-left-sm"
              >身份证后四位: {{ item.certNo }}</text
            >
            <text class="text-color4 text-size24 zy-margin-left-sm">{{ item.className }}</text>
          </view>
          <view class="zy-flex zy-flex-col-center">
            <view v-if="item.visionStatus == '1'" class="zy-tag zy-tag--primary">
              <zy-icons type="vision_E" :size="25"></zy-icons>
              <text>视力正常</text>
            </view>
            <view v-else-if="item.visionStatus == '2'" class="zy-tag zy-tag--warning">
              <zy-icons type="vision_E" :size="25"></zy-icons>
              <text>视力不良</text>
            </view>
            <view v-else class="zy-tag zy-tag--default">
              <zy-icons type="vision_E" :size="25"></zy-icons>
              <text>视力未检测</text>
            </view>
            <view
              v-if="item.refractionStatus == '1'"
              class="zy-tag zy-margin-left-sm zy-tag--primary"
            >
              <zy-icons type="eye" :size="25"> </zy-icons>
              <text>屈光正常</text>
            </view>
            <view
              v-else-if="item.refractionStatus == '2'"
              class="zy-tag zy-margin-left-sm zy-tag--warning"
            >
              <zy-icons type="eye" :size="25"></zy-icons>
              <text>屈光异常</text>
            </view>
            <view v-else class="zy-tag zy-margin-left-sm zy-tag--default">
              <zy-icons type="eye" :size="25"></zy-icons>
              <text>屈光未检测</text>
            </view>
            <view v-if="item.otherResultType != 0">
              <view
                v-if="item.otherResultType == 2"
                class="zy-tag zy-margin-left-sm zy-tag--primary"
              >
                <zy-icons type="succeed" :size="25"></zy-icons>
                <text>其他项</text>
              </view>
              <view
                v-else-if="item.otherResultType == 1"
                class="zy-tag zy-margin-left-sm zy-tag--default"
              >
                <!-- <zy-icons type="scan" :size="25"></zy-icons> -->
                <text>其他项未检测</text>
              </view>
            </view>
          </view>
        </view>
        <view class="zy-flex zy-flex-col-center">
          <zy-icons
            v-if="item.compareResult == '2'"
            type="annotation"
            color="#FE7C00"
            :size="40"
          ></zy-icons>
          <zy-icons type="arrow_right" color="#86909C" :size="48"></zy-icons>
        </view>
      </view>
      <uni-load-more :status="pageData.loadingStatus"></uni-load-more>
    </view>
  </block>
  <!-- 空数据 -->
  <zy-empty v-else></zy-empty>
</template>

<script lang="ts" setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const userInfo = loginStore().userInfo;
const { proxy } = getPublicFuncProxy();
const store = useStore();
const pageData = reactive({
  queryForm: {
    userId: '',
    workId: '',
    name: '',
    workType: '',
    type: '',
    status: '',
    locationId: '',
    classId: '',
    pageNo: 1,
    pageSize: 10,
  },
  pageList: [], // 列表
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
    .getScreenRecord(pageData.queryForm)
    .then(res => {
      // 视力、屈光结果处理
      res.records.forEach(item => {
        item.certNo = item.certNo?.substring(item.certNo.length - 4, item.certNo.length);
        // visionStatus 1 视力正常 2 视力不良 0 未检测
        // refractionStatus 1 屈光正常 2 屈光异常 0 未检测
        // item.visionStatus = '0';
        item.refractionStatus = '0';
        // if (item.leftVision && item.rightVision) {
        //   if (item.leftVision == '正常' && item.rightVision == '正常') {
        //     item.visionStatus = '1';
        //   } else {
        //     item.visionStatus = '2';
        //   }
        // }
        if (item.leftRefraction && item.rightRefraction) {
          if (item.leftRefraction == '屈光正常' && item.rightRefraction == '屈光正常') {
            item.refractionStatus = '1';
          } else {
            item.refractionStatus = '2';
          }
        }
      });
      pageData.pageList.push.apply(pageData.pageList, res.records);
      const noMore = pageData.queryForm.pageNo * pageData.queryForm.pageSize >= res.total;
      pageData.loadingStatus = noMore ? 'noMore' : 'more';
      pageData.queryForm.pageNo++;
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    })
    .catch(err => {
      pageData.loadingStatus = 'more';
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    });
};
onLoad(option => {
  pageData.queryForm.status = option.status || '';
  pageData.queryForm.locationId = option.locationId || '';
  pageData.queryForm.classId = option.classId || '';
  pageData.queryForm.type = option.type || '';
  pageData.queryForm.workId = store.getters.checkWork.id;
  pageData.queryForm.userId = userInfo.id;
  pageData.queryForm.screenType = store.getters.screenType;
  pageData.queryForm.workType = store.getters.checkWork.screenItem || '0';
  getPageList();
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

// 搜索
const onSearch = e => {
  pageData.queryForm.pageNo = 1;
  pageData.pageList = [];
  pageData.loadingStatus = 'more';
  getPageList();
};
// 清除搜索值
const searchClear = () => {
  pageData.queryForm.name = '';
};
const toDetail = data => {
  // if(data.visionStatus == '0' && data.refractionStatus == '0'){
  // 	proxy.$publicFunc.showToast('none', '暂无检测数据');
  // 	return;
  // };
  uni.navigateTo({
    url: '/app-intelligent-iot/vision-health/pages/check/detect/info?studentId=' + data.studentId,
  });
};
</script>

<style lang="scss" scoped></style>
