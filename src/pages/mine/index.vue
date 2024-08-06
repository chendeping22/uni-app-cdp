<template>
  <page>
    <view class="pageBg">
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="head-title-content">
        <u-icon
          style="margin-left: 32rpx"
          name="scan"
          size="48"
          color="#000000"
          @click="handleScan"
        />
        <view class="head-title">我的</view>
        <view style="width: 80rpx" />
      </view>

      <view class="content-head" @click="gotoPersonalData">
        <image
          class="avatar-size"
          :src="
            userInfo?.headImageUrl
              ? userInfo?.headImageUrl.includes('?')
                ? userInfo?.headImageUrl
                : `${userInfo?.headImageUrl}?v1`
              : icon_avatar
          "
          mode="aspectFill"
        />
        <view class="user-rect">
          <view>
            <text class="username-text">{{ userInfo?.name }}</text>
          </view>
          <view>
            <text class="useriden-text">{{ userRole }}</text>
          </view>
        </view>
        <image class="arrow-size" style="margin-right: 36rpx" :src="arrow_right" />
      </view>
      <view
        style="
          border-radius: 16rpx;
          margin: 48rpx 32rpx;
          box-shadow: 0px 2rpx 4rpx 0px rgba(0, 0, 0, 0.04);
          background-color: white;
          overflow: hidden;
        "
      >
        <!-- <view v-if="userInfo?.students && userInfo?.students.length > 0">
          <view class="group-top">
            <image class="left-icon-size" :src="icon_child" />
            <text class="group-top-font-child">我的孩子</text>
            <text class="group-top-font-right-child">{{ getMyChils }}</text>
          </view>
          <view class="line" />
        </view> -->
        <view class="group-top" @click="gotoHelpFeedback">
          <image class="left-icon-size" :src="icon_help" />
          <text class="group-top-font">使用帮助</text>
          <image class="arrow-size" :src="arrow_right" />
        </view>
        <view class="line" />
        <view class="group-top" @click="gotoFeedback">
          <image class="left-icon-size" :src="icon_feedback" />
          <text class="group-top-font">意见反馈</text>
          <image class="arrow-size" :src="arrow_right" />
        </view>
        <view class="line" />
        <view class="group-top" @click="gotoAbout">
          <image class="left-icon-size" :src="icon_info" />
          <text class="group-top-font">关于</text>
          <image class="arrow-size" :src="arrow_right" />
        </view>
      </view>
      <u-tabbar
        v-if="!isNativeTabBar"
        inactive-color="#000000a6"
        :list="currentTabBar"
        :active-color="primaryColor"
      ></u-tabbar>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { requestAllScanCodePer } from '@/services/permissionRequest';
import { loginStore } from '@/store/modules/login';
import { tabBarStore } from '@/store/modules/tabbar';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { EUserType } from '@/utils/kind';
import { scanHandle } from '@/utils/scan';
import { log } from '@/utils/tools';
import track from '@/utils/track';
import { onMounted, onUnmounted, ref, toRefs } from 'vue';
import arrow_right from '/static/arrow_right.svg';
import icon_avatar from '/static/avatar.png';
import icon_feedback from '/static/icon_feedback.svg';
import icon_help from '/static/icon_help.svg';
import icon_info from '/static/icon_info.svg';

// insert statusbar
const statusBarHeight = ref();
const primaryColor = getPrimaryColor();

// store
const store = loginStore();
const { userInfo } = toRefs(store);
console.log('当前用户信息', userInfo.value);
const { isNativeTabBar, currentTabBar } = toRefs(tabBarStore());
const userRole = ref('');
const getMyChils = ref('');

const gotoPersonalData = () => {
  uni.navigateTo({
    url: '/app-platform/mine/personal-data', // 个人资料
  });
};
const gotoHelpFeedback = () => {
  uni.navigateTo({
    url: '/app-platform/mine/help-feedback', // 使用帮助
  });
  // uni.navigateTo({
  //   url: '/app-platform/test/test-download', // 下载测试
  // });
};
const gotoFeedback = () => {
  uni.navigateTo({
    url: '/app-platform/feedback/index', // 意见反馈
  });
};
const gotoAbout = () => {
  uni.navigateTo({
    url: '/app-platform/mine/about', // 关于
  });
};

const handleScan = async () => {
  uni.hideToast();
  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestAllScanCodePer(
      res => {
        // 已有权限
        log('permissionRequestResult : ', res);
        scanHandle();
        // // 检测腾讯X5是否正确安装
        // const path = 'http://soft.imtt.qq.com/browser/tes/feedback.html';
        // const params = { path: path } as IApplication;
        // params.target = ETargetType.TargetTypeAbsoluteH5;
        // goToApplicationFromMsg(params);
      },
      err => {
        // 无权限
        log('permissionRequestFail : ', err);
      },
    );
  }
  // #endif
  // 选择图片文件
  if (!platformAndroid) {
    scanHandle();
    // uni.navigateTo({ url: '/app-platform/contacts/register-form/index' });
  }
};

const updateUser = () => {
  switch (store.currentUserType) {
    case EUserType.teacher:
      userRole.value = '教职工';
      break;
    case EUserType.guardian:
      userRole.value = '家长';
      break;
    case EUserType.student:
      userRole.value = '学生';
      break;
  }

  let length = userInfo.value?.students ? userInfo.value?.students.length : 0;
  log('length : ', length);
  if (length > 0) {
    let childs = '';
    userInfo.value?.students.forEach((item, index) => {
      childs += item.name + (index == length - 1 ? '' : '、');
    });
    getMyChils.value = childs;
  }
};

onMounted(() => {
  //获取手机系统信息
  const info = uni.getSystemInfoSync();
  log('systemInfo : ', info);
  // #ifdef APP-PLUS
  const agentInfo = plus.navigator.getUserAgent();
  log('agentInfo : ', agentInfo);
  // #endif
  //设置状态栏高度
  statusBarHeight.value = info.statusBarHeight;
  uni.$on('switchIdentitySuccess', updateUser);
  updateUser();
  track('pageview', { appCode: 'mine' });
});

onUnmounted(() => {
  uni.$off('switchIdentitySuccess', updateUser);
});
</script>

<style lang="scss" scoped>
.pageBg {
  background-repeat: no-repeat;
  background-image: url('/static/bg_me.svg');
  background-size: cover;
}

.head-title-content {
  display: flex;
  align-items: center;
}

.head-title {
  flex: 1;
  text-align: center;
  font-family: PingFang SC;
  color: #000000e0;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 48rpx;
  margin-top: 24rpx;
  margin-bottom: 24rpx;
}

.content-head {
  margin-left: 32rpx;
  margin-right: 32rpx;
  margin-top: 48rpx;
  margin-bottom: 24rpx;
  align-items: center;
  @extend .content-flex;
  @extend .content-row;
}

.avatar-size {
  width: 112rpx;
  height: 112rpx;
  border: 4rpx solid white;
  border-radius: 50%;
}

.arrow-size {
  width: 40rpx;
  height: 40rpx;
}

.left-icon-size {
  width: 38.52rpx;
  height: 38.52rpx;
}

.user-rect {
  margin-left: 16rpx;
  flex: 1 1 0%;
  @extend .content-column;
}

.username-text {
  color: #242424;
  text-align: center;
  font-family: 'PingFang SC';
  font-size: 40rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 52rpx;
}

.useriden-text {
  color: #00000073;
  text-align: center;
  font-family: 'PingFang SC';
  font-size: 30rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 40rpx;
}

.content-column {
  flex-direction: column;
}

.content-row {
  flex-direction: row;
}

.content-flex {
  display: flex;
}

.group-top {
  align-items: center;
  padding: 24rpx 36rpx;
  @extend .content-flex;
  @extend .content-row;
}

.group-top-font-child {
  color: #000000e0;
  margin-left: 32rpx;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
  overflow: hidden;
  white-space: nowrap;
}

.group-top-font-right-child {
  color: rgba(0, 0, 0, 0.65);
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 0%;
  margin-left: 24rpx;
  align-items: right;
}

.group-top-font {
  color: #000000e0;
  margin-left: 32rpx;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
  flex: 1 1 0%;
}

.group-top-font-right {
  color: rgba(0, 0, 0, 0.65);
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
}

.line {
  width: 100%;
  height: 1rpx;
  flex-shrink: 0;
  margin-left: 32rpx;
  border-radius: var(--radius-radius-none, 0);
  background: var(--global-basic-color-split, #0000000f);
}

:deep(.u-tabbar__content__item__text .u-line-1) {
  font-size: 20rpx;
  line-height: 20rpx;
}

:deep(.u-tabbar__content__item .u-badge) {
  padding: 4rpx 10rpx;
}

:deep(.u-tabbar__content__item__button) {
  top: 12rpx !important;
}

:deep(.u-tabbar__content__item__text) {
  bottom: 12rpx !important;
}
</style>
