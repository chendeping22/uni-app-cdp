<template>
  <view class="vision-card">
    <view class="date">
      <view class="date-title">检测日期</view>
      <view class="date-content">{{ pageData.createTime }} </view>
    </view>
    <view class="user-card">
      <image
        v-if="studentInfo.stuGender == '男'"
        class="user-avatar"
        src="../../../assets/image/avatar_boy.png"
        mode=""
      ></image>
      <image v-else class="user-avatar" src="../../../assets/image/avatar_girl.png" mode=""></image>

      <view>
        <view class="student-clazz"
          >{{ studentInfo.stuSchgradeName }}{{ studentInfo.stuSchclassName }}</view
        >
        <view class="student-name"
          >{{ studentInfo.stuName || studentInfo.studentName }}
          <zy-icons
            :color="studentInfo.stuGender == '男' ? '#176BFB' : '#F53F3F'"
            :type="studentInfo.stuGender == '男' ? 'man' : 'women'"
            :size="32"
          ></zy-icons>
        </view>

        <view class="student-code"
          >身份证后四位：{{
            studentInfo.stuIdNo.substring(
              studentInfo.stuIdNo.length - 4,
              studentInfo.stuIdNo.length,
            ) || ' /'
          }}</view
        >
      </view>
    </view>
    <view class="result">
      <view class="result-title">裸眼视力</view>
      <view class="result-content">
        <view class="result-content-right">
          <view class="result-content-number">
            <view v-if="store.getters.IVisionTestData_vc?.right" class="result-content-number_text">
              {{ store.getters.IVisionTestData_vc?.right
              }}{{ getSideData(store.getters.IVisionTestData_vc?.right) }}</view
            >
            <view v-else class="result-content-number_text"> 缺失</view>
          </view>
          <view class="result-content-text"> 右眼 </view>
        </view>
        <view class="result-content-left">
          <view class="result-content-number">
            <view v-if="store.getters.IVisionTestData_vc?.left" class="result-content-number_text">
              {{ store.getters.IVisionTestData_vc?.left
              }}{{ getSideData(store.getters.IVisionTestData_vc?.left) }}</view
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

<script setup>
import $http from '@/app-intelligent-iot/vision-collect/api';
import { loginEvent } from '@/app-intelligent-iot/vision-collect/utils/loginEvent';
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
    store.getters.studentInfo_vc || {
      stuGender: '男',
    }
  );
});
console.log('🚀 ~ file: result.vue:87 ~ studentInfo ~ studentInfo:', store.getters.studentInfo_vc);
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

const setStudentRecord = async () => {
  if (
    store.getters.IVisionTestData_vc?.left === '' &&
    store.getters.IVisionTestData_vc?.right === ''
  ) {
    uni.showToast({
      title: '左右眼视力不可同时缺失',
      icon: 'none',
    });
    return;
  }
  let prams = {
    threadId: store.getters.checkWork_vc.id,
    stuIdNo:
      store.getters.studentInfo_vc.stuIdNo.length === 4
        ? store.getters.studentInfo_vc.stuIdNo2
        : store.getters.studentInfo_vc.stuIdNo,
    glassType: 0,
    lly: store.getters.IVisionTestData_vc?.left,
    ldj: '',
    rly: store.getters.IVisionTestData_vc?.right,
    rdj: '',
    ldD: '',
    rdD: '',
  };
  console.log('🚀 ~ file: result.vue:121 ~ setStudentRecord ~ prams:', prams);

  $http.kangRui['reportScreenRecord'](prams)
    .then(res => {
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
      loginEvent(userInfo.tel);
      // if (err?.message) {
      //   uni.showToast({
      //     title: err?.message,
      //     icon: 'none',
      //     duration: 5000,
      //   });
      // } else {
      //   uni.showToast({
      //     title: '上报失败',
      //     icon: 'error',
      //   });
      // }
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
