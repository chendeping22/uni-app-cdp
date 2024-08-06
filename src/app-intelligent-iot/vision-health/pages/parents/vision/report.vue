<template>
  <view v-if="pageData.showPage" class="">
    <view class="user-card zy-shadow zy-radius zy-margin-bottom">
      <image
        v-if="pageData.studentReport.sex == '0'"
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_girl.png"
        mode=""
      />
      <image
        v-else
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_boy.png"
        mode=""
      />
      <view class="">
        <view class="">
          {{ pageData.studentReport.name }}
          <text class="text-color4 text-size24">{{ pageData.studentReport.className }}</text>
        </view>
        <view class="text-color5 text-size24">
          身份证后四位: {{ pageData.studentReport.certNo }}
        </view>
      </view>
    </view>
    <view
      class="item-card zy-flex zy-flex-row-between zy-flex-col-center"
      style="border-radius: 0"
      @click="openPopup"
    >
      <view class=""> 检测时间: {{ pageData.optionData.date }} </view>
      <view class="text-color4 zy-flex zy-flex-col-center">
        <text>更多</text>
        <zy-icons type="arrow_right" color="#86909C" :size="48" />
      </view>
    </view>
    <view class="zy-margin">
      <view class="item-card">
        <view class="form-card" style="margin: 0; padding: 0">
          <view
            class="zy-flex zy-flex-row-around zy-padding-top-sm zy-padding-bottom-sm"
            style="column-gap: 20rpx"
          >
            <view class="zy-flex-1" />
            <view class="zy-flex-1" style="text-align: center"> 左眼 </view>
            <view class="zy-flex-1" style="text-align: center"> 右眼 </view>
          </view>
          <view class="zy-padding-left zy-padding-right zy-radius" style="background: #f8f8fa">
            <view
              class="zy-flex zy-flex-row-around zy-flex-col-center zy-padding-top-sm zy-padding-bottom-sm"
              style="column-gap: 20rpx"
            >
              <view class="zy-flex-1"> 检测结果 </view>
              <view class="zy-flex-1">
                <view
                  v-if="!pageData.studentReport.leftVision"
                  class="zy-tag zy-tag--default zy-margin-bottom-sm"
                >
                  <zy-icons type="vision_E" :size="28" />
                  <text class="white-space--nowrap">视力未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.leftVision == '正常'"
                  class="zy-tag zy-tag--primary zy-margin-bottom-sm"
                >
                  <zy-icons type="vision_E" :size="28" />
                  <text>视力正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning zy-margin-bottom-sm">
                  <zy-icons type="vision_E" :size="28" />
                  <text>视力不良</text>
                </view>
                <view v-if="!pageData.studentReport.leftRefraction" class="zy-tag zy-tag--default">
                  <zy-icons type="eye" :size="28" />
                  <text class="white-space--nowrap">屈光未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.leftRefraction == '屈光正常'"
                  class="zy-tag zy-tag--primary"
                >
                  <zy-icons type="eye" :size="28" />
                  <text>屈光正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning">
                  <zy-icons type="eye" :size="28" />
                  <text>屈光异常</text>
                </view>
              </view>
              <view class="zy-flex-1">
                <view
                  v-if="!pageData.studentReport.rightVision"
                  class="zy-tag zy-tag--default zy-margin-bottom-sm"
                >
                  <zy-icons type="vision_E" :size="28" />
                  <text class="white-space--nowrap">视力未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.rightVision == '正常'"
                  class="zy-tag zy-tag--primary zy-margin-bottom-sm"
                >
                  <zy-icons type="vision_E" :size="28" />
                  <text>视力正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning zy-margin-bottom-sm">
                  <zy-icons type="vision_E" :size="28" />
                  <text>视力不良</text>
                </view>
                <view v-if="!pageData.studentReport.rightRefraction" class="zy-tag zy-tag--default">
                  <zy-icons type="eye" :size="28" />
                  <text class="white-space--nowrap">屈光未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.rightRefraction == '屈光正常'"
                  class="zy-tag zy-tag--primary"
                >
                  <zy-icons type="eye" :size="28" />
                  <text>屈光正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning">
                  <zy-icons type="eye" :size="28" />
                  <text>屈光异常</text>
                </view>
              </view>
            </view>
            <view
              v-for="(item, index) in pageData.tableData"
              :key="index"
              class="zy-flex zy-flex-row-around zy-padding-top-sm zy-padding-bottom-sm zy-border-solid-top"
              style="column-gap: 20rpx"
            >
              <view class="zy-flex-1">
                {{ item.title }}
              </view>
              <view class="zy-flex-1" style="text-align: center">
                {{ item.leftVal }}
              </view>
              <view class="zy-flex-1" style="text-align: center">
                {{ item.rightVal }}
              </view>
            </view>
          </view>
        </view>
        <block v-if="pageData.studentReport.suggest">
          <view class="suggest-title zy-flex zy-flex-col-center">
            <zy-icons type="suggest" :size="48" />
            <text class="zy-margin-left-xs">就诊建议</text>
          </view>
          <view class="text-size28" style="line-height: 44rpx">
            {{ pageData.studentReport.suggest }}
          </view>
        </block>
        <block
          v-if="
            pageData.studentReport.leftYscbbzFlag == '1' ||
            pageData.studentReport.rightYscbbzFlag == '1'
          "
        >
          <view class="suggest-title zy-flex zy-flex-col-center">
            <zy-icons type="eye" :size="36" />
            <text class="zy-margin-left-xs">远视储备不足</text>
          </view>
          <view class="text-size28" style="line-height: 44rpx">
            12岁及以下儿童的眼球为远视状态，随着生长发育，远视度数逐渐降低，这种生理性远视称为远视储备。由于过早
            过多近距离用眼，部分儿童青少年提前用完远视储备，极易发展为近视。
          </view>
        </block>
      </view>
      <!-- 视力变化趋势 -->
      <vision-line-charts
        :chart-data="pageData.visionChartData"
        canvas-id="vision-charts"
        title="视力变化趋势"
      />
      <!-- 屈光变化趋势 -->
      <vision-line-charts
        :chart-data="pageData.refractionChartData"
        canvas-id="refraction-charts"
        title="屈光变化趋势"
      />
      <!-- 护眼建议 -->
      <eye-care-advice />
      <!-- 推荐阅读 -->
      <recommended-reading />
    </view>
  </view>
  <!-- 空数据 -->
  <zy-empty v-else />
  <!-- 弹窗 -->
  <zy-select-popup
    ref="popupRef"
    title="选择检测时间"
    :list="pageData.selectList"
    @change="dateChange"
  />
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import eyeCareAdvice from '../components/eye-care-advice';
import recommendedReading from '../components/recommended-reading.vue';
import visionLineCharts from '../components/vision-line-charts';
import { onLoad } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
const { proxy } = getPublicFuncProxy();
const pageData = reactive({
  showPage: false,
  optionData: {},
  selectList: [],
  studentReport: {},
  visionChartData: {}, // 视力图表
  refractionChartData: {}, // 屈光图表
  tableData: [],
  tableConfig: [
    {
      title: '裸眼视力',
      leftVal: '',
      rightVal: '',
      keys: ['leftNaked', 'rightNaked'],
      scale: 1,
    },
    {
      title: '戴镜视力',
      leftVal: '',
      rightVal: '',
      keys: ['leftWearGlass', 'rightWearGlass'],
      scale: 1,
    },
    {
      title: '球镜',
      leftVal: '',
      rightVal: '',
      keys: ['leftSph', 'rightSph'],
      scale: 2,
    },
    {
      title: '柱镜',
      leftVal: '',
      rightVal: '',
      keys: ['leftCyl', 'rightCyl'],
      scale: 2,
    },
    {
      title: '轴位',
      leftVal: '',
      rightVal: '',
      keys: ['leftAxis', 'rightAxis'],
      // }, {
      // 	title: '等效球镜',
      // 	leftVal: '',
      // 	rightVal: '',
      // 	keys: ['leftSphSe', 'rightSphSe']
    },
    {
      title: '角膜水平曲率',
      leftVal: '',
      rightVal: '',
      keys: ['leftK1', 'rightK1'],
      scale: 2,
    },
    {
      title: '角膜垂直曲率',
      leftVal: '',
      rightVal: '',
      keys: ['leftK2', 'rightK2'],
      scale: 2,
    },
    {
      title: '角膜水平曲率半径',
      leftVal: '',
      rightVal: '',
      keys: ['leftR1', 'rightR1'],
      scale: 2,
    },
    {
      title: '角膜垂直曲率半径',
      leftVal: '',
      rightVal: '',
      keys: ['leftR2', 'rightR2'],
      scale: 2,
    },
    {
      title: '角膜水平曲率半径轴位',
      leftVal: '',
      rightVal: '',
      keys: ['leftA1', 'rightA1'],
    },
    {
      title: '角膜垂直曲率半径轴位',
      leftVal: '',
      rightVal: '',
      keys: ['leftA2', 'rightA2'],
    },
    {
      title: '散光',
      leftVal: '',
      rightVal: '',
      keys: ['leftSg', 'rightSg'],
      scale: 2,
    },
    {
      title: '瞳孔直径',
      leftVal: '',
      rightVal: '',
      keys: ['leftPupilDiameter', 'rightPupilDiameter'],
      scale: 2,
    },
    {
      title: '上下凝视',
      leftVal: '',
      rightVal: '',
      keys: ['leftVerticalGazeAngle', 'rightVerticalGazeAngle'],
    },
    {
      title: '鼻侧/颞侧凝视',
      leftVal: '',
      rightVal: '',
      keys: ['leftHorizontalGateAngle', 'rightHorizontalGateAngle'],
    },
    {
      title: '瞳距',
      leftVal: '',
      rightVal: '',
      keys: ['pupilDistance', 'pupilDistance'],
    },
  ],
});
const popupRef = ref(null);
// 打开弹窗
const openPopup = () => {
  popupRef.value.openPopup(pageData.optionData.date);
};
// 检查时间选择
const dateChange = e => {
  pageData.optionData.date = e.value;
  getParentStudentRecord();
};
// 检测时间
const getStudentScreenTime = () => {
  $http.parents
    .getStudentScreenTime({
      studentId: pageData.optionData.bizid,
    })
    .then(res => {
      if (res && res.length) {
        pageData.showPage = true;
        res.forEach(item => {
          pageData.selectList.push({
            name: item,
            value: item,
          });
        });
        pageData.optionData.date = res[0];
        getParentStudentRecord();
      } else {
        pageData.showPage = false;
      }
    })
    .catch(err => {
      pageData.showPage = false;
    });
};
// 获取学生检测记录
const getParentStudentRecord = () => {
  proxy.$publicFunc.showLoading();
  $http.parents
    .getParentStudentRecord({
      studentId: pageData.optionData.bizid,
      screenTime: pageData.optionData.date, //检测时间
    })
    .then(res => {
      pageData.tableData = [];
      res.certNo = res.certNo?.substring(res.certNo.length - 4, res.certNo.length);
      pageData.studentReport = res;
      // 表格数据
      pageData.tableConfig.forEach(item => {
        item.leftVal = res[item.keys[0]];
        item.rightVal = res[item.keys[1]];
        const isValue =
          (item.leftVal || typeof (item.leftVal === 'number')) &&
          (item.rightVal || typeof item.rightVal === 'number');
        if (isValue) {
          if (typeof item.scale == 'number') {
            item.leftVal = Number(res[item.keys[0]]).toFixed(item.scale);
            item.rightVal = Number(res[item.keys[1]]).toFixed(item.scale);
          }
          pageData.tableData.push(item);
        }
      });
      // 图表数据
      if (res.records && res.records.length) {
        // visionChartData: {}, // 视力图表
        // refractionChartData: {}, // 屈光图表
        const categories = [];
        const leftNakedArr = [];
        const rightNakedArr = [];
        const leftSphArr = [];
        const rightSphArr = [];
        res.records.forEach(item => {
          categories.push(formatDate(item.screenTime * 1000));
          leftNakedArr.push(item.leftNaked || 0);
          rightNakedArr.push(item.rightNaked || 0);
          leftSphArr.push(Math.abs(item.leftSph || 0));
          rightSphArr.push(Math.abs(item.rightSph || 0));
        });
        pageData.visionChartData = {
          categories: categories,
          series: [
            {
              name: '左眼',
              legendShape: 'circle',
              data: leftNakedArr,
            },
            {
              name: '右眼',
              legendShape: 'circle',
              data: rightNakedArr,
            },
          ],
        };
        pageData.refractionChartData = {
          categories: categories,
          series: [
            {
              name: '左眼',
              legendShape: 'circle',
              data: leftSphArr,
            },
            {
              name: '右眼',
              legendShape: 'circle',
              data: rightSphArr,
            },
          ],
        };
      }
      proxy.$publicFunc.hideLoading();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
    });
};
const formatDate = time => {
  let date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

onLoad(option => {
  // ?code=XXX&type=XXX&bizid=XXXX
  // code 换取用户信息
  // type 1学生 2班级 3年级
  // bizid type2班级bizid type3年级bizid
  pageData.optionData = {
    code: option.code,
    type: option.type,
    bizid: option.bizid,
  };
  // if (pageData.optionData.code) {
  // 	$http.login.codeLogin({
  // 		code: pageData.optionData.code
  // 	}).then(res => {
  // 		console.log(res)
  // 		uni.setStorageSync('TOKEN', res.token);
  // 		// uni.setStorageSync('user', res.userInfo);
  // 		store.commit("UPDATE_USERINFO", res.userInfo);
  // 	})
  // }
  getStudentScreenTime();
});
</script>

<style lang="scss" scoped>
.suggest-title {
  padding: 30rpx 0;
  color: $zy-spare-color6;
  display: flex;
  align-items: center;
}
</style>
