<template>
  <view class="">
    <view
      class="item-card zy-flex zy-flex-row-between zy-flex-col-center zy-margin-top-sm"
      style="border-radius: 0"
      @click="openPopup"
    >
      <view class="">
        {{ pageData.optionData.name || '暂无工作' }}
      </view>
      <view class="text-color4 zy-flex zy-flex-col-center">
        <zy-icons type="arrow_right" color="#86909C" :size="48" />
      </view>
    </view>
    <view v-if="pageData.showPage" class="zy-margin-left zy-margin-right zy-margin-bottom">
      <view class="zy-flex zy-flex-row-between">
        <view class="refraction-item zy-shadow">
          <view class="text-color4">
            <text class="refraction-item--tag tag-green" />
            应筛查学生数
          </view>
          <view class="text-size44">
            {{ pageData.screenData.studentNum }}
          </view>
        </view>
        <view class="refraction-item zy-shadow">
          <view class="text-color4">
            <text class="refraction-item--tag" />
            已筛查
          </view>
          <view class="text-size44">
            {{ pageData.screenData.totalNum }}
          </view>
        </view>
        <view class="refraction-item zy-shadow">
          <view class="text-color4">
            <text class="refraction-item--tag tag-orange" />
            未筛查
          </view>
          <view class="text-size44">
            {{ pageData.screenData.surplusNum }}
          </view>
        </view>
      </view>
      <!-- 视力筛查结果 -->
      <view class="zy-margin-top-sm">
        <vision-progress :progress-data="pageData.progressData" title="视力筛查结果" />
      </view>
      <!-- 近视等级占比情况 -->
      <vision-ring-charts
        :chart-data="pageData.chartData"
        :myopia-rate="pageData.progressData.myopiaRate"
        canvas-id="ring-charts"
        title="近视等级占比情况"
      />
      <!-- 表格 -->
      <vision-table
        :table-data="pageData.tableData"
        :table-config="pageData.tableConfig"
        @rowClick="rowClick"
      />
    </view>
    <!-- 空数据 -->
    <zy-empty v-else />
    <!-- 弹窗 -->
    <zy-select-popup
      ref="popupRef"
      title="选择检测工作"
      :list="pageData.selectList"
      @change="dateChange"
      @close-popup="closePopup"
    />
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { onLoad } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';
import VisionProgress from './components/vision-progress';
import VisionRingCharts from './components/vision-ring-charts';
import VisionTable from './components/vision-table';

const { proxy } = getPublicFuncProxy();

const pageData = reactive({
  optionData: {},
  screenData: {}, // 筛查数据
  progressData: {}, // 视力筛查结果
  chartData: {}, // 饼图数据
  tableData: [], // 表格数据
  // 表头配置
  tableConfig: [
    {
      title: '排名',
      type: 'index',
      width: '70rpx',
    },
    {
      title: '班级',
      key: 'className',
      width: '240rpx',
    },
    {
      title: '班级人数',
      key: 'total',
      width: '100rpx',
    },
    {
      title: '近视率',
      key: 'myoRate',
      width: '100rpx',
    },
  ],
  selectList: [],
  showPage: false,
});

// 查询当前学年工作
const getNowWork = () => {
  $http.teacher
    .getNowWork({
      gradeId: pageData.optionData.bizid,
      locationId: pageData.optionData.locationId,
    })
    .then(res => {
      if (res && res.length) {
        pageData.showPage = true;
        pageData.optionData.workId = res[0].id;
        pageData.optionData.name = res[0].name;
        res.forEach(item => {
          pageData.selectList.push({
            value: item.id,
            name: item.name,
          });
        });
        getClazzRecord();
      } else {
        pageData.showPage = false;
      }
    })
    .catch(err => {
      pageData.showPage = false;
    });
};
// 获取年级数据
const getClazzRecord = () => {
  let data = {
    type: '0', // 0:年级主任  1:班主任
    id: pageData.optionData.bizid, // 年级主任为 年级id ，班主任为班级id
    workId: pageData.optionData.workId, // 工作id
  };
  proxy.$publicFunc.showLoading();
  $http.teacher
    .getClazzRecord(data)
    .then(res => {
      let surplusNum = 0;
      if (res.surplusNum > 0) {
        surplusNum = res.surplusNum;
      }
      // 筛查数据
      pageData.screenData = {
        studentNum: res.studentNum || 0,
        surplusNum: surplusNum,
        totalNum: res.totalNum || 0,
      };
      if (res.clazzList && res.clazzList.length) {
        // 表格数据
        pageData.tableData = res.clazzList.sort((a, b) => {
          let diff = b.myoRate - a.myoRate;

          if (diff === 0 && typeof String.prototype.localeCompare === 'function') {
            return (b.className || '').localeCompare(a.className);
          }

          return diff;
        });
        res.clazzList.forEach(item => {
          item.myoRate = item.myoRate * 100 + '%';
        });
      } else {
        pageData.tableData = [];
      }
      // 视力筛查结果
      pageData.progressData = {
        ...res,
      };
      // 近视等级占比情况-饼图数据
      let visionLevelMap = res.visionLevelMap || {
        low: 0,
        moderate: 0,
        high: 0,
      };
      const totalNum = Object.values(visionLevelMap).reduce((acc, cur) => acc + (cur || 0), 0);
      const lowRate = parseFloat(((visionLevelMap.low / totalNum) * 100).toFixed(2)) || 0;
      const modeRate = parseFloat(((visionLevelMap.moderate / totalNum) * 100).toFixed(2)) || 0;
      const highRate = parseFloat(((visionLevelMap.high / totalNum) * 100).toFixed(2)) || 0;
      pageData.chartData = {
        series: [
          {
            data: [
              {
                name: '轻度近视',
                value: lowRate,
                legendText: `轻度近视 ${lowRate}%`,
              },
              {
                name: '中度近视',
                value: modeRate,
                legendText: `中度近视 ${modeRate}%`,
              },
              {
                name: '高度近视',
                value: highRate,
                legendText: `高度近视 ${highRate}%`,
              },
            ],
          },
        ],
      };
      proxy.$publicFunc.hideLoading();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
    });
};
const popupRef = ref(null);
// 打开弹窗
const openPopup = () => {
  popupRef.value.openPopup(pageData.optionData.workId);
};
// 检查时间选择
const dateChange = e => {
  pageData.optionData.workId = e.value;
  pageData.optionData.name = e.name;
  getClazzRecord();
};
// 行点击
const rowClick = data => {
  uni.navigateTo({
    url: `/vision-health/pages/teacher/class?bizid=${data.classId}&className=${data.className}&workId=${pageData.optionData.workId}&type=3&locationId=${pageData.optionData.locationId}`,
  });
};
onLoad(option => {
  // type=XXX&bizid=XXXX
  // type 1学生 2班级 3年级
  // bizid type2班级bizid type3年级bizid
  const userInfo = loginStore().userInfo;
  pageData.optionData = {
    type: option.type,
    bizid: option.bizid,
    locationId: userInfo?.locationId,
  };
  getNowWork();
});
</script>

<style lang="scss" scoped>
.refraction-item {
  background: $zy-middle-color2;
  border-radius: 12rpx;
  min-width: 210rpx;
  padding: 20rpx;
  text-align: center;
  font-size: $zy-font-size28;

  &--tag {
    display: inline-block;
    width: 8rpx;
    height: 20rpx;
    background: $zy-main-color;
    border-radius: 12rpx;
    backdrop-filter: blur(20rpx);
  }

  .tag-green {
    background: $zy-spare-color5;
  }

  .tag-orange {
    background: $zy-spare-color6;
  }
}
</style>
