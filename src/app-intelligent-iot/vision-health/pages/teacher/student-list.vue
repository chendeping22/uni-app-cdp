<template>
  <view class="">
    <view class="student-main">
      <view class="letter-list">
        <view
          v-for="item in pageData.letterList"
          :key="item"
          :class="[
            'letter-list--item',
            { 'letter-active': pageData.letterIndex == (item == '#' ? 'none' : item) },
          ]"
          @click.stop="scrollTo(item)"
        >
          {{ item }}
        </view>
      </view>
      <!-- 学生列表 -->
      <scroll-view
        :scroll-into-view="pageData.letterIndex"
        :scroll-y="true"
        :scroll-with-animation="true"
        style="height: 100vh"
      >
        <view class="zy-flex zy-flex-row-between" style="margin: 20rpx 30rpx">
          <view class="refraction-item zy-shadow zy-flex zy-flex-row-between zy-flex-col-center">
            <view class="text-color4">
              <text class="refraction-item--tag tag-green"></text>
              视力不良
            </view>
            <view class="text-size44">
              {{ pageData.screenData.visionErrorNum }}
            </view>
          </view>
          <view class="refraction-item zy-shadow zy-flex zy-flex-row-between zy-flex-col-center">
            <view class="text-color4">
              <text class="refraction-item--tag"></text>
              屈光异常
            </view>
            <view class="text-size44">
              {{ pageData.screenData.refractionErrorNum }}
            </view>
          </view>
        </view>
        <view class="student-list">
          <view
            v-for="(item, index) in pageData.pageList"
            :id="item.letter"
            :key="index"
            class="student-item"
            @click="selectStudent(item)"
          >
            <view class="">
              <view class="zy-margin-bottom-xs">
                <text style="font-weight: 500">{{ item.name }}</text>
                <text class="text-size24 text-color4 zy-margin-left-sm"
                  >身份证后四位: {{ item.certNo }}</text
                >
              </view>
              <view class="zy-flex zy-flex-col-center">
                <view v-if="item.visionStatus == '1'" class="zy-tag zy-tag--primary">
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text>视力正常</text>
                </view>
                <view v-else-if="item.visionStatus == '2'" class="zy-tag zy-tag--warning">
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text>视力不良</text>
                </view>
                <view v-else class="zy-tag zy-tag--default">
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text>视力未检测</text>
                </view>
                <view
                  v-if="item.refractionStatus == '1'"
                  class="zy-tag zy-margin-left-sm zy-tag--primary"
                >
                  <zy-icons type="eye" :size="28"> </zy-icons>
                  <text>屈光正常</text>
                </view>
                <view
                  v-else-if="item.refractionStatus == '2'"
                  class="zy-tag zy-margin-left-sm zy-tag--warning"
                >
                  <zy-icons type="eye" :size="28"></zy-icons>
                  <text>屈光异常</text>
                </view>
                <view v-else class="zy-tag zy-margin-left-sm zy-tag--default">
                  <zy-icons type="eye" :size="28"></zy-icons>
                  <text>屈光未检测</text>
                </view>
              </view>
            </view>
            <view class="">
              <zy-icons type="arrow_right" :size="48" color="#86909C"></zy-icons>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import makePy from '@/app-intelligent-iot/vision-health/utils/strChineseFirstPY.js';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
const { proxy } = getPublicFuncProxy();
let title = '视力统计';

const pageData = reactive({
  screenData: {}, // 筛查数据
  letterList: [], // 字母索引列表
  letterIndex: '', // 字母索引
  pageList: [], // 列表
  loadingStatus: 'more', // loading的状态 more/loading/noMore
});

onLoad(option => {
  title = option.className || title;
  pageData.optionData = {
    type: option.type,
    bizid: option.bizid,
    workId: option.workId || '',
  };
  // 生成26个小写字母集合
  const CHARCODE_A_LC = 65;
  pageData.letterList = new Array(26)
    .fill(null)
    .map((v, i) => String.fromCharCode(CHARCODE_A_LC + i));
  pageData.letterList.unshift('#');
  getStudentList();
});

const setTitle = navTitle => {
  setTimeout(() => {
    uni.setNavigationBarTitle({
      title: navTitle,
    });
  }, 50);
};

onReady(() => {
  setTitle(title);
});

// 选中字母索引，滚动到指定位置
const scrollTo = index => {
  pageData.letterIndex = index == '#' ? 'none' : index;
};
// 获取学生列表
const getStudentList = () => {
  proxy.$publicFunc.showLoading();
  let data = {
    type: '1',
    id: pageData.optionData.bizid, // 班级id
    workId: pageData.optionData.workId, // 工作id
  };
  $http.teacher
    .getStudentRecord(data)
    .then(res => {
      pageData.screenData = {
        visionErrorNum: res.visionErrorNum || 0,
        refractionErrorNum: res.refractionErrorNum || 0,
      };
      // 列表数据
      // 视力、屈光结果处理
      res.recordList.forEach(item => {
        let pingyin = makePy(item.name[0]);
        item.letter = pingyin.length ? pingyin[0] : 'none';
        item.certNo = item.certNo?.substring(item.certNo.length - 4, item.certNo.length);
        // visionStatus 1 视力正常 2 视力不良 0 未检测
        // refractionStatus 1 屈光正常 2 屈光异常 0 未检测
        item.visionStatus = '0';
        item.refractionStatus = '0';
        if (item.leftVision && item.rightVision) {
          if (item.leftVision == '正常' && item.rightVision == '正常') {
            item.visionStatus = '1';
          } else {
            item.visionStatus = '2';
          }
        }
        if (item.leftRefraction && item.rightRefraction) {
          if (item.leftRefraction == '屈光正常' && item.rightRefraction == '屈光正常') {
            item.refractionStatus = '1';
          } else {
            item.refractionStatus = '2';
          }
        }
      });
      // 按中文首字母排序
      let objectArraySort = function (keyName) {
        return function (objectN, objectM) {
          let valueN = objectN[keyName].toUpperCase();
          let valueM = objectM[keyName].toUpperCase();
          if (valueN < valueM) return -1;
          else if (valueN > valueM) return 1;
          else return 0;
        };
      };
      pageData.pageList = res.recordList.sort(objectArraySort('letter'));
      proxy.$publicFunc.hideLoading();
    })
    .catch(err => {
      console.log(err, 'err');
      proxy.$publicFunc.hideLoading();
    });
};
// 选中学生
const selectStudent = data => {
  uni.navigateTo({
    url: '/app-intelligent-iot/vision-health/pages/teacher/student-report?id=' + data.id,
  });
};
</script>

<style lang="scss" scoped>
.refraction-item {
  background: $zy-middle-color2;
  border-radius: 12rpx;
  width: calc(50% - 10rpx);
  padding: 20rpx 30rpx;
  font-size: $zy-font-size28;

  &--tag {
    display: inline-block;
    width: 8rpx;
    height: 20rpx;
    background: $zy-spare-color6;
    border-radius: 12rpx;
    backdrop-filter: blur(20rpx);
  }
}

.student-main {
  position: relative;

  .letter-list {
    position: absolute;
    right: 0;
    top: 240rpx;
    z-index: 999;
    color: $zy-middle-color5;
    font-size: $zy-font-size24;

    &--item {
      width: 32rpx;
      height: 32rpx;
      line-height: 32rpx;
      text-align: center;
    }

    .letter-active {
      background: $zy-main-color;
      color: $zy-middle-color2;
      border-radius: 50%;
    }
  }

  .student-list {
    margin: 0 30rpx;

    .student-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: $zy-middle-color2;
      padding: 20rpx 30rpx;
      line-height: 48rpx;
      margin-bottom: 20rpx;
      border-radius: 12rpx;
    }
  }
}
</style>
