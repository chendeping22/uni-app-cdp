<template>
  <view class="vision-card">
    <view class="date">
      <view class="date-title">检测日期</view>
      <view class="date-content">{{ pageData.createTime }} </view>
    </view>
    <view class="user-card">
      <image
        v-if="studentInfo.gender == '男' || studentInfo.gender == 1"
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_boy.png"
        mode=""
      ></image>
      <image
        v-else
        class="user-avatar"
        src="@/app-intelligent-iot/static/image/avatar_girl.png"
        mode=""
      ></image>

      <view>
        <view class="student-clazz">{{ studentInfo.clazzName }}</view>
        <view class="student-name"
          >{{ studentInfo.name || studentInfo.studentName }}
          <zy-icons
            :color="studentInfo.gender == '男' || studentInfo.gender == 1 ? '#176BFB' : '#F53F3F'"
            :type="studentInfo.gender == '男' || studentInfo.gender == 1 ? 'man' : 'women'"
            :size="32"
          ></zy-icons>
        </view>

        <view class="student-code">学号:{{ studentInfo.studentCode || ' /' }}</view>
      </view>
    </view>
    <view class="result">
      <view class="result-title">裸眼视力</view>
      <view class="result-content">
        <view class="result-content-right">
          <view class="result-content-number">
            <view v-if="store.getters.IVisionTestData?.right" class="result-content-number_text">
              {{ store.getters.IVisionTestData?.right
              }}{{ getSideData(store.getters.IVisionTestData?.right) }}</view
            >
            <view v-else class="result-content-number_text"> 缺失</view>
          </view>
          <view class="result-content-text"> 右眼 </view>
        </view>
        <view class="result-content-left">
          <view class="result-content-number">
            <view v-if="store.getters.IVisionTestData?.left" class="result-content-number_text">
              {{ store.getters.IVisionTestData?.left
              }}{{ getSideData(store.getters.IVisionTestData?.left) }}</view
            >
            <view v-else class="result-content-number_text"> 缺失</view>
          </view>
          <view class="result-content-text"> 左眼 </view>
        </view>
      </view>
    </view>
  </view>
  <view class="foot-btn">
    <view class="write-btn" hover-class="zy-hover" @click="setStudentRecord">确认，上报数据</view>
  </view>
</template>

<script lang="ts" setup>
import { publish } from '@/app-intelligent-iot/js-bridge/bleConnectService';
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, reactive } from 'vue';
import { lowVisionForm, visionForm } from './util';

const userInfo = loginStore().userInfo;
const store = useStore();
const { proxy } = getPublicFuncProxy();

// 获取学生信息
const studentInfo = computed(() => {
  return (
    store.getters.studentInfo || {
      gender: '男',
    }
  );
});
/* 获取视力附属数据 */
const getSideData = val => {
  const target = visionForm.find(item => item.l === val),
    target2 = lowVisionForm.find(item => item.l === val);
  return `(${target ? target.r : target2.r})`;
};

const pageData = reactive({
  createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  studentId: '',
});

const getSN = () => {
  //写一个promise 获取sn 然后返回
  return new Promise((resolve, reject) => {
    console.log('********************publish获取sn');
    console.log(
      '********************publish获取deviceId',
      store.getters.classicBluetoothInfo.deviceId,
      typeof store.getters.classicBluetoothInfo.deviceId,
    );
    publish(
      store.getters.classicBluetoothInfo.deviceId,
      {
        message: 'CTS_SN,200#',
      },
      res => {
        console.log('+++++++++++++++++++++++++++');
        if (res.code == 0) {
          console.log('********************获取sn', res.data);
          const data = res.data.split(',')[1].replace('#', '');
          resolve(data);
        }
      },
    );
  });
};
const setStudentRecord = async () => {
  if (store.getters.IVisionTestData?.left === '' && store.getters.IVisionTestData?.right === '') {
    uni.showToast({
      title: '左右眼视力不可同时缺失',
      icon: 'none',
    });
    return;
  }

  $http.check['addScreenRecord']({
    workType: store.getters.checkWork.screenItem || '0',
    screenWorkId: store.getters.checkWork.id,
    studentId: pageData.studentId,
    visionUserId: userInfo.id,
    leftNaked: store.getters.IVisionTestData?.left,
    rightNaked: store.getters.IVisionTestData?.right,
    missing:
      store.getters.IVisionTestData?.left === '' || store.getters.IVisionTestData?.right === ''
        ? 1
        : 0,
  })
    .then(() => {
      uni.hideLoading();
      uni.showToast({
        title: '上报成功',
        icon: 'success',
      });
      setTimeout(() => {
        uni.navigateBack({
          delta: 4,
        });
      }, 1000);
    })
    .catch(err => {
      uni.hideLoading();
      if (err?.message) {
        uni.showToast({
          title: err?.message,
          icon: 'none',
          duration: 5000,
        });
      } else {
        uni.showToast({
          title: '上报失败',
          icon: 'error',
        });
      }
    });
};

onLoad(option => {
  pageData.studentId = option.studentId;
});
</script>

<style lang="scss" scoped>
.vision-card {
  background: #ffffff;
  border-radius: 3rpx;
  margin: 32rpx;
  padding: 24rpx 32rpx;
}

.user-card {
  width: 100%;
  margin-top: 48rpx;
  padding: 0;
}
.date {
  display: flex;
  &-title {
    font-size: 28rpx;
    line-height: 28rpx;
    color: #86909c;
  }

  &-content {
    margin-left: 24rpx;
    font-size: 28rpx;
    line-height: 28rpx;
    color: #1d2129;
  }
}

.result {
  margin-top: 48rpx;
  &-title {
    font-size: 30rpx;
    color: #4e5969;
    font-weight: 500;
  }

  &-content {
    display: flex;
    margin-top: 20rpx;
    &-left {
      margin-left: 80rpx;
    }
    &-left,
    &-right {
      height: 90rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    &-number {
      font-size: 40rpx;
      color: #1d2129;
      &_text {
        line-height: 40rpx;
      }
    }

    &-text {
      font-size: 28rpx;
      color: #4e5969;
    }
  }
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

.student {
  width: 100%;
  &-clazz {
    height: 36rpx;
    font-size: 24rpx;
    color: #86909c;
    text-align: left;
    line-height: 36rpx;
    font-weight: 400;
  }
  &-code {
    height: 36rpx;
    font-size: 24rpx;
    color: #86909c;
    text-align: left;
    line-height: 36rpx;
    font-weight: 400;
  }
  &-name {
    display: flex;
    align-items: center;
    height: 48rpx;
  }
}

.foot-btn {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 32rpx;
  width: 100%;
}
</style>
