<template>
  <page custom-overflow="visible">
    <view class="content-head" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="content-head__inner">
        <view class="head-left" @click="showMessageBroomDialog">
          <image class="icon_broom" :src="icon_broom"></image>
          <!-- <text style="margin-top: 5rpx">全部已读</text> -->
        </view>
        <view class="head-title">消息</view>
      </view>
    </view>
    <!--分类消息列表-->
    <view
      v-if="notificationList?.array.length"
      class="notification-list"
      :style="{
        paddingTop: contentPaddingTop + 'px',
        paddingBottom: contentPaddingBottom + 'px',
      }"
    >
      <view
        v-for="item in notificationList.array"
        :key="item.lastNotifyTime"
        class="notification-list-item"
        @click="setReadToDetail(item)"
      >
        <view class="content">
          <view :class="['icon-container', item.iconType]">
            <u-image
              class="icon"
              :show-loading="false"
              :error-icon="icon_default_app"
              :fade="false"
              :src="item.appLogo ?? icon_default_app"
              width="80"
              height="80"
            />
            <u-badge
              class="unread"
              :count="item.unReadQty"
              :overflow-count="99"
              absolute="true"
              :offset="[-10, -10]"
            />
          </view>
          <view class="content-right">
            <view class="main-info">
              <text :class="['title']">{{ item.groupTypeName }}</text>
              <text :class="['time']">{{ timeFormat(item.lastNotifyTime) }}</text>
            </view>
            <text :class="['detail']">{{
              `${item.lastNotifyTitle}: ${item.lastNotifyContent}`
            }}</text>
          </view>
        </view>
      </view>
    </view>
    <u-empty-custom
      v-else
      v-show="isShowEmptyView"
      text="暂无数据"
      model="list"
      class="content-empty"
    />
    <!-- #ifdef APP-PLUS || H5 -->
    <view v-if="!isNativeTabBar" :style="{ height: '100rpx' }"></view>
    <!--#endif-->
    <u-tabbar
      v-if="!isNativeTabBar"
      inactive-color="#000000a6"
      :list="currentTabBar"
      :active-color="primaryColor"
    ></u-tabbar>
  </page>
</template>

<script lang="ts" setup>
import {
  IUnreadNumParamsFilter,
  getNotifyTypeGroupFilter,
  markReadAll,
} from '@/services/systemMessages';
import { loginStore } from '@/store/modules/login';
import { tabBarStore } from '@/store/modules/tabbar';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { getUnreadNum } from '@/utils/get-unread-num';
import { EUserType } from '@/utils/kind';
import { debounce } from '@/utils/lodash-es';
import { setAppBadgeNum } from '@/utils/push-jump';
import { clientType } from '@/utils/tools';
import track from '@/utils/track';
import { onShow } from '@dcloudio/uni-app';
import { onBeforeMount, onMounted, onUnmounted, reactive, ref, toRefs } from 'vue';
import { getFilterCode, timeFormat } from './utils';
import { originIconTypeMap } from './utils/constant';
import icon_default_app from '/static/application.png';
import icon_broom from '/static/icon_broom.png';
type Items = {
  groupTypeName: string; // 宿舍考勤
  groupType: string; // dormAttendance
  lastNotifyTitle: string; // 放学归寝异常
  lastNotifyContent: string; // 小学六年级1班签退统计:2人缺勤,0人早退
  lastNotifyTime: string; // 1702429813000
  unReadQty: string; // 5
  iconType: string;
  appLogo: string;
};

const statusBarHeight = ref(0);
const primaryColor = getPrimaryColor();
// default: 96rpx + 24rpx. 96 for title bar height, 24 for padding
const contentPaddingTop = ref(uni.upx2px(120));
const contentPaddingBottom = ref(0);

const store = loginStore();
const { isNativeTabBar, currentTabBar } = toRefs(tabBarStore());

const isShowEmptyView = ref(false);
const notificationList = reactive({ array: [] as Items[] });

const dotPosition = ref(0);

const switchIdentityThenInit = () => {
  fetchDataFunc();
};

const unreadMsgRefresh = debounce(() => {
  console.log('unreadMsgRefresh');
  fetchDataFunc();
}, 300);

// 请求数据
const fetchDataFunc = async () => {
  getUnreadNum();

  const params = {
    userId: store.userInfo?.userId,
    clientType,
    userType: EUserType.teacher === store.currentUserType ? 1 : 2,
    ...getFilterCode(),
  } as IUnreadNumParamsFilter;

  const res = await getNotifyTypeGroupFilter(params);

  let iconTypeMap: Record<string, string> = {
    ...originIconTypeMap,
  };

  // 云上课堂-消息中心：教师端app、家长端小程序
  const isGuardian = import.meta.env.VITE_COMPOSITION === 'guardian';

  let ignoreEmpty = false;

  // #ifdef MP-WEIXIN
  if (isGuardian) {
    iconTypeMap.cloudClass = 'cloudClass';
  }
  // #endif

  // #ifdef APP-PLUS
  if (isGuardian) {
    // 家长端app只有云上课堂
    iconTypeMap = {
      cloudClass: 'cloudClass',
    };
    ignoreEmpty = true;
  } else {
    iconTypeMap.cloudClass = 'cloudClass';
  }
  // #endif

  console.log('res : ', res);
  const listData = res
    ?.map((item: Record<string, string>) => {
      const iconType = iconTypeMap[item?.groupType] || '';
      // 云上课堂、在线教研、资源管理没有小程序通知，所以过滤(包含H5)
      const isRecord = ['cloudClass', 'teachingActivities', 'resourceManagement'].includes(
        item?.groupType,
      );
      // 家校app目前只有云上课堂应用，根据ignoreEmpty进行过滤
      // if (!iconType && (ignoreEmpty || isRecord)) {
      //   return null;
      // }
      return { ...item, iconType };
    })
    .filter(Boolean) as Items[];
  notificationList.array = listData;

  console.log('notificationList : ', notificationList);
  if (notificationList.array.length === 0) {
    isShowEmptyView.value = true;
  }
};

const setLayoutSize = () => {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight || 0;

  const screenWidth = info.screenWidth;
  dotPosition.value = uni.upx2px(screenWidth);

  contentPaddingTop.value = statusBarHeight.value + uni.upx2px(120);
};

// const updateDot = () => {
//   getUnreadNum();
//   uni.$emit('refresh-data');
// };

// 跳转消息类型列表
const setReadToDetail = async (item: { groupType: string; groupTypeName: string }) => {
  const { groupType, groupTypeName } = item;
  console.log('groupType:', groupType);
  console.log('groupTypeName:', groupTypeName);
  uni.navigateTo({
    url: `/app-platform/message/notification-list?type=${groupType}&typeName=${groupTypeName}`,
  });
};

const showMessageBroomDialog = async function () {
  uni.showModal({
    title: '',
    content: '您确定全部标记成已读吗?',
    confirmText: '确定',
    cancelText: '取消',
    success: function (res) {
      if (res.confirm) {
        console.log('全部已读了');
        markReadConfirm();
      }
    },
  });
};

// 确定设置全部已读
const markReadConfirm = async () => {
  const params = {
    userId: store.userInfo?.userId,
    clientType,
    userType: EUserType.teacher === store.currentUserType ? 1 : 2,
    ...getFilterCode(),
  } as IUnreadNumParamsFilter;

  await markReadAll(params);
  // #ifdef APP-PLUS
  // 更新app角标数量
  await setAppBadgeNum();
  // #endif
  // 全部已读后重新请求列表/列表状态全部设为已读
  const newList: any = notificationList.array.map(v => ({ ...v, unReadQty: 0 }));
  // notificationList.array.length = 0;
  notificationList.array = newList;
  // Object.assign(notificationList, newList);
  console.log('notificationList length : ' + notificationList.array.length);
  // 获取未读通知数
  await getUnreadNum();
  uni.hideTabBarRedDot({ index: 1 });
};

onShow(() => {
  console.log('message onShow');
  getUnreadNum();
  uni.$emit('refresh-data');
});

onBeforeMount(() => {
  setLayoutSize();
  fetchDataFunc();

  uni.$on('switchIdentitySuccess', switchIdentityThenInit); // 组织切换刷新消息
  uni.$on('unreadMessageNotice', unreadMsgRefresh); // mqtt新消息刷新消息
  uni.$on('refresh-data', fetchDataFunc);
  // uni.$on('refresh-app-msg', updateDot);
});

onMounted(() => {
  track('pageview', { appCode: 'message' });
});

onUnmounted(() => {
  uni.$off('switchIdentitySuccess', switchIdentityThenInit);
  uni.$off('unreadMessageNotice', unreadMsgRefresh);
  uni.$off('refresh-data', fetchDataFunc);
  // uni.$off('refresh-app-msg', updateDot);
});
</script>

<style lang="scss" scoped>
.title {
  // font-family: PingFang SC;
  color: #000000e0;
  text-align: center;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 48rpx;
}
.content-head {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: #fff;
  box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.03);

  &__inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
  }
  .head-left {
    @extend .title;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(0, -50%);
    display: flex;
    margin-left: 32rpx;
    padding-left: 24rpx;
    line-height: 40rpx;
    font-size: 30rpx;
  }
  .head-title {
    @extend .title;
  }
}
.icon_broom {
  width: 48rpx;
  height: 48rpx;
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

.content-empty {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.notification-list {
  padding: 0 32rpx;
  .notification-list-item {
    align-items: center;
    width: 100%;
    margin-bottom: 24rpx;
    padding: 24rpx 32rpx;
    background-color: white;
    border-bottom: 1px solid #e5e6eb;
    border-radius: 16rpx;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
    .content {
      position: relative;
      display: flex;
      width: 100%;
      align-items: center;
      .icon-container {
        position: relative;
        width: 80rpx;
        height: 80rpx;
        margin-right: 32rpx;
      }

      .content-right {
        flex: 1;
        .main-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8rpx;
          .title {
            font-size: 34rpx;
            color: #1d2129;
            line-height: 48rpx;
            @include ellipsis;
          }
          .time {
            flex: 1;
            text-align: right;
            font-size: 26rpx;
            color: #86909c;
            letter-spacing: 0;
            line-height: 24rpx;
          }
        }
        .detail {
          font-size: 26rpx;
          color: #86909c;
          line-height: 36rpx;
          @include ellipsis-some-line(1);
        }
      }
    }
    .image {
      margin-top: 32rpx;
      width: 622rpx;
      height: 360rpx;
    }
  }
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
