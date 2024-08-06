<template>
  <view class="zy-margin-top-sm">
    <view class="form-card zy-shadow">
      <view class="zy-flex zy-flex-row-between zy-padding-top-sm zy-padding-bottom-sm">
        <view class=""> 戴镜类型 </view>
        <view class="text-color4">
          {{ pageData.glassType }}
        </view>
      </view>
    </view>
    <zy-vision-form :data="pageData.tableData" disabled></zy-vision-form>
    <view v-if="isShowOther">
      <view
        v-for="(item, index) in ldxScreenOtherRecords"
        :key="index"
        class="zy-margin-top-sm zy-margin-bottom-sm form-card zy-shadow"
      >
        <view class="zy-padding-top-sm zy-padding-bottom-sm">
          <view class="titleName">{{ item.itemName }}</view>
          <view v-for="(t, i) in item.indicatorVos" :key="i">
            <view class="nameStyle zy-padding-top-sm"> {{ t.indicatorName }} </view>
            <view class="zy-flex zy-flex-row-around zy-flex-col-center zy-padding-top-sm">
              <view class="valueStyle"> {{ t.indicatorVal }} </view>
              <view v-if="t.unit" class="unitStyle"> {{ t.unit }} </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="block"></view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { useStore } from '@/store/old';
import { onLoad } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';
const { proxy } = getPublicFuncProxy();
const store = useStore();
const isShowOther = ref(false);
const ldxScreenOtherRecords = ref([]);
const pageData = reactive({
  glassType: '不戴镜',
  queryForm: {
    userId: '',
    studentId: '',
    screenWorkId: '',
    workType: '',
  },
  tableData: [],
  tableConfig: [
    {
      title: '裸眼视力',
      leftVal: '',
      rightVal: '',
      autoDot: true,
      // type: 'digit',
      keys: ['leftNaked', 'rightNaked'],
      scale: 1,
    },
    {
      title: '戴镜视力',
      leftVal: '',
      rightVal: '',
      autoDot: true,
      // type: 'digit',
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
      title: '顶点距',
      leftVal: '',
      rightVal: '',
      keys: ['vertexDistance', 'vertexDistance'],
    },
    {
      title: '瞳距',
      leftVal: '',
      rightVal: '',
      keys: ['pupilDistance', 'pupilDistance'],
    },
  ],
});
// 获取戴镜类型
const getGlassType = type => {
  if (!type) return;
  $http.public
    .getDictItems({
      dictCode: 'screen_glass_type',
    })
    .then(res => {
      res.forEach(item => {
        if (type == item.value) {
          pageData.glassType = item.title;
        }
      });
    });
};
// 获取检测记录
const getScreenInfo = () => {
  proxy.$publicFunc.showLoading();
  $http.check
    .getScreenInfo(pageData.queryForm)
    .then(res => {
      if (res) {
        isShowOther.value = res.ldxScreenOtherRecords ? true : false;
        ldxScreenOtherRecords.value = res.ldxScreenOtherRecords || [];
        const ldxScreenRecords = res?.ldxScreenRecord;
        console.log(
          '🚀 ~ file: info.vue:198 ~ getScreenInfo ~ ldxScreenRecords:',
          ldxScreenRecords,
        );
        if (ldxScreenRecords) {
          getGlassType(ldxScreenRecords.type);
          pageData.tableConfig.forEach(item => {
            item.leftVal =
              ldxScreenRecords[item.keys[0]] === '' || ldxScreenRecords[item.keys[0]] === null
                ? '/'
                : ldxScreenRecords[item.keys[0]];
            item.rightVal =
              ldxScreenRecords[item.keys[1]] === '' || ldxScreenRecords[item.keys[1]] === null
                ? '/'
                : ldxScreenRecords[item.keys[1]];
            const isValue = typeof item.leftVal === 'number' && typeof item.rightVal === 'number';
            if (isValue) {
              if (typeof item.scale == 'number') {
                item.leftVal = Number(ldxScreenRecords[item.keys[0]]).toFixed(item.scale);
                item.rightVal = Number(ldxScreenRecords[item.keys[1]]).toFixed(item.scale);
              }
            }

            pageData.tableData.push(item);
          });
          console.log('🚀 ~ file: info.vue:223 ~ getScreenInfo ~  pageData.tableData:', '' ?? '/');
        }
      }
      proxy.$publicFunc.hideLoading();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
    });
};
onLoad(option => {
  pageData.queryForm.studentId = option.studentId;
  pageData.queryForm.screenWorkId = store.getters.checkWork.id;
  pageData.queryForm.workType = store.getters.checkWork.screenItem || '0';
  pageData.queryForm.itemId = store.getters.checkType;
  getScreenInfo();
});
</script>
<style scoped>
.titleName {
  font-size: 32rpx;
  color: #1d2129;
  text-align: left;
  line-height: 48rpx;
  font-weight: 500;
}

.valueStyle {
  padding: 10rpx 20rpx;
  background: #f2f3f4;
  border-radius: 10rpx;
  flex: 1;
  margin-right: 25rpx;
  height: 55rpx;
}

.block {
  height: 100rpx;
}

.unitStyle {
  max-width: 100rpx;
  min-width: 35rpx;
  overflow: hidden;
}
</style>
