<template>
  <view class="container">
    <view>
      <view class="vision-card">
        <view class="vision-e">
          <image
            class="icon-e"
            :class="`icon-e icon-e-${pageData.chart.direction}`"
            src="@/app-intelligent-iot/static/image/icon_E_right.svg"
            mode="widthFix"
          ></image>
          <view v-if="store.getters.classicBluetoothInfo?.name !== 'kaxVision'" class="text-e"
            >第{{ pageData.chart.index }}个</view
          >
        </view>
        <view class="vision-form">
          <view v-for="item in visionForm" :key="item.l">
            <view
              :class="
                pageData.currentKey === item.l
                  ? 'vision-form-item_active vision-form-item'
                  : ' vision-form-item'
              "
              @click="handleClickWithBle(item)"
              >{{ item.l }}({{ item.r }})
              <image
                v-if="pageData.currentKey === item.l"
                class="icon-selected"
                src="@/app-intelligent-iot/static/image/Select_Succeed_blue.png"
                mode="widthFix"
              ></image>
            </view>
          </view>
          <view
            :class="
              pageData.currentKey === ''
                ? 'vision-form-item_active vision-form-item'
                : ' vision-form-item'
            "
            @click="
              handleClickWithBle({
                l: '',
                r: '',
              })
            "
            >缺失
            <image
              v-if="pageData.currentKey === ''"
              class="icon-selected"
              src="@/app-intelligent-iot/static/image/Select_Succeed_blue.png"
              mode="widthFix"
            ></image>
          </view>
        </view>
        <view class="low-vison-btn" @click="pageData.showLowVision = !pageData.showLowVision"
          >低视力
          <view class="zy-flex zy-flex-col-center">
            <zy-icons
              type="arrow_right"
              color="#176bfb"
              :size="48"
              :class="`${pageData.showLowVision ? 'arrow-up' : 'arrow-down'}`"
            />
          </view>
        </view>
        <view v-show="pageData.showLowVision" class="low-vision-form">
          <view v-for="item in lowVisionForm" :key="item.l">
            <view
              :class="
                pageData.currentKey === item.l
                  ? 'low-vision-form-item_active low-vision-form-item'
                  : 'low-vision-form-item'
              "
              @click="handleClick(item)"
              >{{ item.l }}({{ item.r }})
              <image
                v-if="pageData.currentKey === item.l"
                class="icon-selected"
                src="@/app-intelligent-iot/static/image/Select_Succeed_blue.png"
                mode="widthFix"
              ></image>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="foot-btn">
      <view
        v-if="pageData.eye === 'left'"
        class="write-btn"
        hover-class="zy-hover"
        @click="handleSave"
        >检测完成</view
      >
      <view v-else class="write-btn" hover-class="zy-hover" @click="handleNextStep">
        保存，测左眼
      </view>
    </view>
  </view>
</template>

<script setup>
import { publish } from '@/app-intelligent-iot/js-bridge/bleConnectService';
import { useStore } from '@/store/old';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { lowVisionForm, visionForm } from './util';

const store = useStore();
const pageData = reactive({
  currentKey: '4.7',
  showLowVision: false,
  chart: {
    index: 0,
    direction: 'right',
  },
  eye: 'right',
  studentId: '',
});

const handleNextStep = () => {
  uni.navigateTo({
    url: `/app-intelligent-iot/vision-health/pages/check/visual-acuity-test/index?eye=left&studentId=${pageData.studentId}`,
  });
};

const kangRui = res => {
  const directionIndex = res.data.split(',')[1].split('')[0];
  let direction;
  switch (Number(directionIndex)) {
    case 0:
      direction = 'up';
      break;
    case 1:
      direction = 'down';
      break;
    case 2:
      direction = 'left';
      break;
    case 3:
      direction = '';
      break;
  }
  pageData.chart.direction = direction;
};

const handleClickWithBle = item => {
  pageData.currentKey = item.l;
  store.commit(
    'UPDATE_IVISION_DATA',
    pageData.eye === 'left'
      ? {
          right: store.getters.IVisionTestData?.right,
          left: item.l,
        }
      : {
          left: store.getters.IVisionTestData?.left,
          right: item.l,
        },
  );
  console.log('🚀 ~ file: index.vue:162 ~ handleClickWithBle ~ item.l:', item.l);

  if (!item.l) {
    return;
  }
  let cmd;
  if (store.getters.classicBluetoothInfo?.name == 'kaxVision' && item.l) {
    cmd = `CTS_SV,${Number(item.l * 10)}#`;
  } else {
    cmd = {
      cmd: 'VisualChart',
      level: visionForm.findIndex(val => val.l === item.l),
    };
  }
  console.log('🚀 ~ file: index.vue:171 ~ handleClickWithBle ~ cmd:', cmd);
  console.log(
    '🚀 ~ file: index.vue:179 ~ handleClickWithBle ~ store.getters.classicBluetoothInfo.deviceId:',
    store.getters.classicBluetoothInfo.deviceId,
  );

  publish(
    store.getters.classicBluetoothInfo.deviceId,
    {
      message: cmd,
    },
    res => {
      console.log('🚀 ~ file: index.vue:182 ~ handleClickWithBle ~ res:', res);
      if (res.code == '0') {
        if (store.getters.classicBluetoothInfo?.name == 'kaxVision') {
          kangRui(res);
        } else {
          pageData.chart.index = JSON.parse(res.data).index + 1;
          pageData.chart.direction = JSON.parse(res.data).direction;
        }
      } else {
        proxy.$publicFunc.showToast('none', res.msg);
      }
    },
  );
};

const handleClick = item => {
  pageData.currentKey = item.l;
  store.commit(
    'UPDATE_IVISION_DATA',
    pageData.eye === 'left'
      ? {
          right: store.getters.IVisionTestData?.right,
          left: item.l,
        }
      : {
          left: store.getters.IVisionTestData?.left,
          right: item.l,
        },
  );
};

const handleSave = async () => {
  uni.navigateTo({
    url: `/app-intelligent-iot/vision-health/pages/check/visual-acuity-test/result?studentId=${pageData.studentId}`,
  });
};
onReady(() => {
  if (pageData.eye === 'left')
    uni.setNavigationBarTitle({
      title: '视力检测-左眼',
    });
});

onLoad(option => {
  pageData.eye = option.eye;
  pageData.studentId = option.studentId;

  if (option.eye !== 'left') {
    store.commit('UPDATE_IVISION_DATA', {
      left: '',
      right: '',
    });
  }
  // if (store.getters.classicBluetoothInfo?.name == 'kaxVision') {
  //   if (pageData.eye !== 'left') {
  //     ////////////////////////////////左眼的时候不需要再开启医生模型,因为右眼的时候开启过了
  //     publish(
  //       store.getters.classicBluetoothInfo.deviceId,
  //       {
  //         message: 'CTS_ST_WITH_DOC,200#',
  //       },
  //       res => {
  //         if (res.code == '0') {
  //         } else {
  //           proxy.$publicFunc.showToast('none', res.msg);
  //         }
  //       },
  //     );
  //   }

  //   setTimeout(() => {
  //     handleClickWithBle({
  //       l: '4.7',
  //       r: '0.5',
  //     });
  //   }, 1000);
  // } else {
  handleClickWithBle({
    l: '4.7',
    r: '0.5',
  });
  // }
});
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 160rpx;
}
.icon-e {
  height: 80rpx;
  width: 80rpx;
  &-up {
    transform: rotate(-90deg);
  }
  &-left {
    transform: rotate(-180deg);
  }
  &-down {
    transform: rotate(90deg);
  }
}

.icon-selected {
  width: 36rpx;
  height: 36rpx;
  position: absolute;
  bottom: 0;
  right: 0;
}

.text-e {
  color: #f53f3f;
  font-weight: bold;
  font-size: 28rpx;
}

.vision-e {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90rpx;
  margin-bottom: 32rpx;
}

.empty_bg {
  width: 200rpx;
  margin: 140rpx auto 70rpx;
}

.write-btn {
  width: 686rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  margin: 0 auto;
  background: $zy-main-color;
  color: $zy-middle-color2;
  border-radius: 12rpx;
}

.vision-card {
  background: #ffffff;
  box-shadow: 0rpx 0rpx 20rpx 0rpx rgba(29, 33, 41, 0.05);
  border-radius: 3rpx;
  padding: 32rpx;
  margin: 32rpx;
}

.vision-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-row-gap: 24rpx;
  grid-column-gap: 24rpx;

  &-item {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f2f3f4;
    border-radius: 12rpx;
    height: 80rpx;

    &_active {
      color: #176bfb !important;
      background: #e8f3ff !important;
    }
  }
}

.low-vision-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-row-gap: 24rpx;
  grid-column-gap: 24rpx;

  &-item {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f2f3f4;
    border-radius: 12rpx;
    height: 80rpx;

    &_active {
      color: #176bfb !important;
      background: #e8f3ff !important;
    }
  }
}

.low-vison-btn {
  margin: 34rpx 0;
  width: 100%;
  text-align: center;
  color: #176bfb;
  display: flex;
  justify-content: center;
  display: flex;
  align-items: center;
}

.foot-btn {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 32rpx;
  width: 100%;
}

.arrow-up {
  transform: rotate(-90deg);
}

.arrow-down {
  transform: rotate(90deg);
}
</style>
