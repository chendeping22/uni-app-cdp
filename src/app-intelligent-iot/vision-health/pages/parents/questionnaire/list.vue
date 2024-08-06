<template>
  <view class="">
    <view v-if="pageData.pageList && pageData.pageList.length" class="zy-margin">
      <view
        v-for="(item, index) in pageData.pageList"
        :key="index"
        class="check-item zy-flex zy-flex-row-between zy-flex-col-center zy-shadow"
        @click="toDetail(item)"
      >
        <view class="zy-flex-1">
          <view class="zy-text-ellipsis-2">
            {{ item.name }}
          </view>
          <view class="text-size24 text-color4 zy-margin-top-sm">
            <zy-icons type="time" />
            {{ item.createTime }}
            ~
            {{ item.endDate }}
          </view>
        </view>
        <view class="zy-margin-left-sm">
          <view v-if="item.status == '0'" class="check-item--tag tag-type-end"> 已结束 </view>
          <view v-else-if="item.isAnswer == '1'" class="check-item--tag tag-type-start">
            已填写
          </view>
          <view v-else class="check-item--tag"> 去填写 </view>
          <!-- <view class="check-item--tag tag-type-start" v-if="item.isAnswer == '1'">
						已填写
					</view>
					<view class="check-item--tag" v-else-if="judgeDate(item.endDate+' 23:59:59') < 0">
						去填写
					</view>
					<view class="check-item--tag tag-type-end" v-else>
						已结束
					</view> -->
        </view>
      </view>
      <uni-load-more :status="pageData.loadingStatus" />
    </view>
    <!-- 空数据 -->
    <zy-empty v-else />
  </view>
</template>
parents/questionnaire
<script lang="ts" setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const userInfo = loginStore().userInfo;
const store = useStore();
const { proxy } = getPublicFuncProxy();
// 初始化页面数据
const pageData = reactive({
  isRefresh: false,
  optionData: {},
  pageList: [], // 列表数据
  queryForm: {
    pageNo: 1,
    pageSize: 10,
    userId: '',
    roleType: 'parent',
  },
  loadingStatus: 'more', // loading的状态 more/loading/noMore
});

// 跳转到详情页面
const toDetail = data => {
  let finish = '0';
  if (judgeDate(data.endDate + ' 23:59:59') > 0 && data.isAnswer != '1') {
    finish = '1';
    // proxy.$publicFunc.showToast('none', '问卷已结束');
    // return;
  }
  pageData.isRefresh = true;
  uni.navigateTo({
    url: `/app-intelligent-iot/vision-health/pages/parents/questionnaire/info?id=${data.id}&name=${data.name}&isAnswer=${data.isAnswer}&finish=${finish}`,
  });
};

// 获取列表
const getPageList = () => {
  if (pageData.loadingStatus != 'more') return;
  pageData.loadingStatus = 'loading';
  if (pageData.queryForm.pageNo == 1) {
    proxy.$publicFunc.showLoading();
  }
  $http.questionaire
    .getListInGuardian(pageData.queryForm)
    .then(res => {
      pageData.pageList.push.apply(pageData.pageList, res.result.records);
      const noMore = pageData.queryForm.pageNo * pageData.queryForm.pageSize >= res.result.total;
      pageData.loadingStatus = noMore ? 'noMore' : 'more';
      pageData.queryForm.pageNo++;
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
      pageData.isRefresh = false;
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
      pageData.loadingStatus = 'more';
      uni.stopPullDownRefresh();
      pageData.isRefresh = false;
    });
};
const judgeDate = tomodifyDate => {
  let nowTime = new Date().getTime();
  let endTime = new Date(tomodifyDate.replace(/-/g, '/')).getTime();
  return nowTime - endTime;
};

onShow(() => {
  // pageData.queryForm.userId = userInfo.id;
  console.log('userInfo', store.getters.userInfo);

  if (pageData.isRefresh) {
    pageData.queryForm.pageNo = 1;
    pageData.pageList = [];
    pageData.loadingStatus = 'more';
    getPageList();
  }
});
onLoad(() => {
  pageData.queryForm.userId = userInfo.personId;
  getPageList();
});

// 下拉刷新
onPullDownRefresh(() => {
  console.log('下拉刷新触发');
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
</style>
