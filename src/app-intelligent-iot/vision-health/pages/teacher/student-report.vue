<template>
  <view class="">
    <view class="user-card zy-shadow zy-radius zy-margin-bottom">
      <image
        v-if="pageData.studentReport.sex == '0'"
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_girl.png"
        mode=""
      ></image>
      <image
        v-else
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_boy.png"
        mode=""
      ></image>
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
    <view class="zy-margin">
      <view class="item-card">
        <view class="form-card" style="margin: 0; padding: 0">
          <view
            class="zy-flex zy-flex-row-around zy-padding-top-sm zy-padding-bottom-sm"
            style="column-gap: 20rpx"
          >
            <view class="zy-flex-1"></view>
            <view class="zy-flex-1" style="text-align: center"> 左眼 </view>
            <view class="zy-flex-1" style="text-align: center"> 右眼 </view>
          </view>
          <view class="hover-bg--gray zy-padding-left zy-padding-right zy-radius">
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
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text class="white-space--nowrap">视力未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.leftVision == '正常'"
                  class="zy-tag zy-tag--primary zy-margin-bottom-sm"
                >
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text>视力正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning zy-margin-bottom-sm">
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text>视力不良</text>
                </view>
                <view v-if="!pageData.studentReport.leftRefraction" class="zy-tag zy-tag--default">
                  <zy-icons type="eye" :size="28"> </zy-icons>
                  <text class="white-space--nowrap">屈光未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.leftRefraction == '屈光正常'"
                  class="zy-tag zy-tag--primary"
                >
                  <zy-icons type="eye" :size="28"> </zy-icons>
                  <text>屈光正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning">
                  <zy-icons type="eye" :size="28"> </zy-icons>
                  <text>屈光异常</text>
                </view>
              </view>
              <view class="zy-flex-1">
                <view
                  v-if="!pageData.studentReport.rightVision"
                  class="zy-tag zy-tag--default zy-margin-bottom-sm"
                >
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text class="white-space--nowrap">视力未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.rightVision == '正常'"
                  class="zy-tag zy-tag--primary zy-margin-bottom-sm"
                >
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text>视力正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning zy-margin-bottom-sm">
                  <zy-icons type="vision_E" :size="28"></zy-icons>
                  <text>视力不良</text>
                </view>
                <view v-if="!pageData.studentReport.rightRefraction" class="zy-tag zy-tag--default">
                  <zy-icons type="eye" :size="28"> </zy-icons>
                  <text class="white-space--nowrap">屈光未检测</text>
                </view>
                <view
                  v-else-if="pageData.studentReport.rightRefraction == '屈光正常'"
                  class="zy-tag zy-tag--primary"
                >
                  <zy-icons type="eye" :size="28"> </zy-icons>
                  <text>屈光正常</text>
                </view>
                <view v-else class="zy-tag zy-tag--warning">
                  <zy-icons type="eye" :size="28"> </zy-icons>
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
            <zy-icons type="suggest" :size="48"></zy-icons>
            <text class="zy-margin-left-xs">就诊建议</text>
          </view>
          <view class="text-size28" tyle="line-height: 44rpx;">
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
            <zy-icons type="eye" :size="36"></zy-icons>
            <text class="zy-margin-left-xs">远视储备不足</text>
          </view>
          <view class="text-size28" style="line-height: 44rpx">
            12岁及以下儿童的眼球为远视状态，随着生长发育，远视度数逐渐降低，这种生理性远视称为远视储备。由于过早
            过多近距离用眼，部分儿童青少年提前用完远视储备，极易发展为近视。
          </view>
        </block>
      </view>
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
const { proxy } = getPublicFuncProxy();
const pageData = reactive({
  studentReport: {},
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
    {
      title: '眼轴长度',
      leftVal: '',
      rightVal: '',
      keys: ['leftAl', 'rightAl'],
    },
  ],
});

// 获取筛查结果
const getScreenReport = id => {
  proxy.$publicFunc.showLoading();
  let data = {
    id: id,
  };
  $http.teacher
    .getScreenReport(data)
    .then(res => {
      res.certNo = res.certNo?.substring(res.certNo.length - 4, res.certNo.length);
      pageData.studentReport = res;
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
      proxy.$publicFunc.hideLoading();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
    });
};

onLoad(option => {
  getScreenReport(option.id);
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
