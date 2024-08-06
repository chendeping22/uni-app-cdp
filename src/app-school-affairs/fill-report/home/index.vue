<template>
  <view class="box">
    <view class="card flex-space-between">
      <view>
        <view class="font30 font-gray">我创建的</view>
        <view class="font40 font-weight500 m16 text-center">
          {{ statistics?.createNumber || '-' }}
        </view>
      </view>
      <view>
        <view class="font30 font-gray">我接收的</view>
        <view class="font40 font-weight500 m16 text-center">
          {{ statistics?.receiveNumber || '-' }}
        </view>
      </view>
      <view>
        <view class="font30 font-gray">及时率</view>
        <view class="font40 font-weight500 m16 text-center">
          {{ statistics?.timelinessRate ? statistics?.timelinessRate + '%' : '-' }}
        </view>
      </view>
      <view>
        <view class="font30 font-gray">平均滞留</view>
        <view class="font40 font-weight500 m16 text-center">
          {{ timeFormat(statistics?.averageResidenceTime) }}
        </view>
      </view>
    </view>
    <!-- 待填报 -->
    <view class="card-empty mt24">
      <view class="card-line flex-space-between">
        <view class="title">待填报</view>
        <view class="flex-align-items" @click="jumpto(0)">
          <view class="font-gray font26 mr20">剩余时间</view>
          <view><u-icon name="arrow-right" color="#595959" size="26"></u-icon></view>
        </view>
      </view>
      <view v-if="toBeCompletedList.length">
        <view
          v-for="(item, index) in toBeCompletedList"
          :key="index"
          class="flex-space-between content-box line-bottom"
          @click="toDetail(item)"
        >
          <view class="flex-align-items flex-1">
            <view class="mr16 company">{{ item?.type == 1 ? '单位' : '个人' }}</view>
            <view class="mr16 name-style flex-1">{{ item?.name }}</view>
          </view>
          <view :class="['status', colorEvent(item, 0)]">{{ item?.remainTime }}</view>
        </view>
      </view>
      <view v-else class="p20">
        <u-empty-custom text="暂无数据" card mode="list"></u-empty-custom>
      </view>
    </view>
    <!-- 已填报 -->
    <view class="card-empty mt24">
      <view class="card-line flex-space-between">
        <view class="title">已填报</view>
        <view class="flex-align-items" @click="jumpto(1)">
          <view class="font-gray font26 mr20">滞留时间</view>
          <view><u-icon name="arrow-right" color="#595959" size="26"></u-icon></view>
        </view>
      </view>
      <view v-if="completedList.length">
        <view
          v-for="(item, index) in completedList"
          :key="index"
          class="flex-space-between content-box line-bottom"
          @click="toDetail(item)"
        >
          <view class="flex-align-items flex-1">
            <view class="mr16 company">{{ item?.type == 1 ? '单位' : '个人' }}</view>
            <view class="mr16 name-style flex-1">{{ item?.name }}</view>
          </view>
          <view :class="['status', colorEvent(item, 1)]">{{ item?.residenceTime }}</view>
        </view>
      </view>
      <view v-else class="p20">
        <u-empty-custom text="暂无数据" card mode="list"></u-empty-custom>
      </view>
    </view>
    <!-- 我创建的 -->
    <view class="card-empty mt24">
      <view class="card-line flex-space-between">
        <view class="title">我创建的</view>
        <view class="flex-align-items" @click="jumpto(2)">
          <view class="font-gray font26 mr20">填报进度</view>
          <view style="padding-top: 5rpx">
            <u-icon name="arrow-right" color="#595959" size="26"></u-icon>
          </view>
        </view>
      </view>
      <view v-if="myCreatedList.length">
        <view
          v-for="(item, index) in myCreatedList"
          :key="index"
          class="flex-space-between content-box line-bottom2"
          @click="toDetail(item, 'my')"
        >
          <view class="mr30 name-style flex-1">{{ item?.fillName }}</view>
          <view class="line-progress">
            <u-line-progress
              :active-color="fillColor(item.progressBarColor)"
              :percent="item?.fillReportProgress"
              :show-percent="false"
              height="15"
            >
            </u-line-progress>
          </view>
          <view v-if="item?.progressBarTag == 0" class="status2 font26">
            {{ item?.fillReportProgress }}%
          </view>
          <view v-else-if="item?.progressBarTag == 1" class="status2">
            <u-icon name="checkmark-circle-fill" color="#52C41A" size="35"></u-icon>
          </view>
          <view v-else-if="item?.progressBarTag == 3" class="status2 font26 red">
            {{ item?.fillReportProgress }}%
          </view>
          <view v-else class="status2">
            <u-icon name="close-circle-fill" color="#FF4D4F" size="35"></u-icon>
          </view>
        </view>
      </view>
      <view v-else class="p20">
        <u-empty-custom text="请使用电脑创建填报任务" card mode="list"></u-empty-custom>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { computed, onMounted, ref } from 'vue';
import { baseFillReportsList, myCount, pageDoFillReport } from '../../services/fill-report';

const statistics = ref<any>({
  averageResidenceTime: 0,
  createNumber: 0,
  receiveNumber: 0,
  timelinessRate: 0,
});
const myCreatedList = ref<any>([]);
const toBeCompletedList = ref<any>([]);
const completedList = ref<any>([]);
const colorEvent = computed(() => (data: any, type: number) => {
  return type === 0 ? data.remainTimeColour : data.residenceTimeColour;
});

onPullDownRefresh(() => {
  console.log('refresh');
  getAllData();
  uni.stopPullDownRefresh();
});
const fillColor = computed(() => (data: string) => {
  switch (data) {
    case 'red':
      return '#ff4d4f';
    case 'orange':
      return '#ffa500';
    case 'green':
      return '#52c41a';
    case 'blue':
      return '#1677ff';
    default:
      return '#8c8c8c';
  }
});
const timeFormat = computed(() => (d: any) => {
  if (!d) {
    return '-';
  }
  const data = Number(d);
  let time;
  if (data < 60) {
    time = data + 'm';
  } else if (data >= 60) {
    const h = parseInt(data / 60 + '');
    const m = data % 60;
    if (h < 1) {
      if (m < 30 && m > 0) {
        time = h + 'm';
      } else if (m >= 30) {
        time = Number(h + 1) + 'h';
      } else if (m == 0) {
        time = h + 'h';
      }
    } else {
      if (m < 30 && m > 0) {
        time = h + 'h';
      } else if (m >= 30) {
        time = Number(h + 1) + 'h';
      } else if (m == 0) {
        time = h + 'h';
      }
    }
  }
  return time;
});
// const fetchDataFunc = async (pager: any, type: string) => {
//   uni.showLoading({
//     title: '加载中',
//   });
//   getAllData();
//   setTimeout(() => {
//     uni.hideLoading();
//   }, 500);
// };
const jumpto = (type: number) => {
  uni.navigateTo({
    url: `/app-school-affairs/fill-report/list/index?type=${type}`,
  });
};
const toDetail = (data: any, type = 'report') => {
  if (type === 'report') {
    uni.navigateTo({
      url: `/app-school-affairs/fill-report/detail/index?fillReportId=${data.fillReportId}&flowBeforeId=${data.flowBeforeId}`,
    });
  } else {
    uni.navigateTo({
      url: `/app-school-affairs/fill-report/detail/index?fillReportId=${data.fillReportId}&flowBeforeId=${data.flowBeforeId}&fromType=1`,
    });
  }
};
/**统计数据 */
const getStatistics = () => {
  myCount().then((res: any) => {
    statistics.value = res;
  });
};
/**待填报 */
const getPageDoFillReport = () => {
  const list = {
    currentPage: 1,
    pageSize: 5,
    status: 0,
  };
  pageDoFillReport(list).then((res: any) => {
    toBeCompletedList.value = res.list;
  });
};
/**已填报 */
const getPageDoFillReport2 = () => {
  const list = {
    currentPage: 1,
    pageSize: 5,
    status: 1,
  };
  pageDoFillReport(list).then((res: any) => {
    completedList.value = res.list;
  });
};
/**我创建的 */
const getBaseFillReportsList = () => {
  const list = {
    currentPage: 1,
    pageSize: 5,
  };
  baseFillReportsList(list).then((res: any) => {
    myCreatedList.value = res.list;
  });
};
const getAllData = () => {
  getStatistics();
  getPageDoFillReport();
  getPageDoFillReport2();
  getBaseFillReportsList();
};
onMounted(() => {
  getAllData();
});
</script>

<style lang="scss" scoped>
.box {
  min-height: calc(100vh + 2rpx);
  padding: 24rpx 32rpx;
}
.flex {
  display: flex;
}
.flex-space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.flex-1 {
  flex: 1;
  overflow: hidden;
}
.flex-align-items {
  display: flex;
  align-items: center;
}
.card {
  padding: 24rpx 41rpx;
  background: #fff;
  border-radius: 10rpx;
  width: 100%;
}
.font26 {
  font-size: 26rpx;
}
.font30 {
  font-size: 30rpx;
}
.font26 {
  font-size: 26rpx;
}
.font40 {
  font-size: 40rpx;
}
.font-gray {
  color: #8c8c8c;
}
.font-weight500 {
  font-weight: 500;
}
.m16 {
  margin-top: 16rpx;
}
.mt24 {
  margin-top: 24rpx;
}
.mr20 {
  margin-right: 20rpx;
}
.mr30 {
  margin-right: 30rpx;
}
.mr16 {
  margin-right: 16rpx;
}
.p20 {
  padding: 20rpx;
}
.title {
  font-size: 34rpx;
  font-weight: 500;
}
.company {
  color: #1677ff;
  background: #e6f4ff;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  white-space: nowrap;
}
.name-style {
  font-size: 30rpx;
  max-width: 370rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.status {
  font-size: 24rpx;
  text-align: right;
  margin-right: 32rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.text-center {
  text-align: center;
}
.card-empty {
  background: #fff;
  border-radius: 10rpx;
  width: 100%;
}
.card-line {
  border-bottom: 1rpx solid #f5f5f5;
  padding: 24rpx 32rpx;
}
.content-box {
  margin-left: 32rpx;
  padding: 24rpx 0;
}
.line-bottom {
  border-bottom: 1rpx solid #f5f5f5;
}
.line-bottom2 {
  border-bottom: 1rpx solid #f5f5f5;
  margin-right: 32rpx;
}
.line-progress {
  width: 12%;
}
.status2 {
  width: 10%;
}
.red {
  color: red;
  background-color: #fff;
}
.orange {
  color: orange;
  background-color: #fff;
}
.grey {
  color: #8c8c8c;
  font-size: 35rpx !important;
  background-color: #fff;
}
.green {
  color: #52c41a;
  background-color: #fff;
}
</style>
