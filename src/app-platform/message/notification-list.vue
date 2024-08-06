<template>
  <!-- <page> -->
  <!-- :class="['notification-list-item', { 'read-status': item.readStatus }]" -->

  <view class="content">
    <u-navbar
      :custom-back="customBack"
      title-color="black"
      :title-bold="true"
      back-icon-color="black"
    >
      <view class="broom" :style="{ marginLeft: leftWidth + 'px', marginRight: rightWidth + 'px' }">
        <view class="icon_broom u-m-l-24 u-m-r-24"></view>
        <text class="title">{{ title }}</text>
        <view
          class="u-p-l-24 u-p-r-24"
          style="height: 70rpx; display: flex; align-items: center"
          @click="showMarkReadMsg"
          ><image class="icon_broom" :src="icon_broom"></image
        ></view>
      </view>
    </u-navbar>
    <scroll-view
      v-if="notificationList?.length"
      scroll-y
      class="scroll-view-wrap"
      :style="{ height: bodyHeight, width: '100%' }"
      refresher-enabled="true"
      :refresher-triggered="triggered"
      :refresher-threshold="100"
      @refresherrefresh="handleRefresh"
      @scrolltolower="bottomRefresh"
    >
      <view class="notification-list-wrapper">
        <view class="notification-list">
          <view
            v-for="item in notificationList"
            :key="item.id"
            :class="['notification-list-item']"
            @click="setReadToDetail(item)"
          >
            <view class="content">
              <view class="content-right">
                <view class="main-info">
                  <view v-if="item.readStatus === 0" class="red-dot" />
                  <text :class="['title']">{{ item.title }}</text>
                  <text :class="['time']">
                    {{ timeFormat(item.notifyTime || item.createTime) }}
                  </text>
                </view>
                <view :class="['detail']">{{ item?.content }}</view>
              </view>
              <image
                v-if="isShowImg(item) && item.imageFileUrl"
                :src="item.imageFileUrl"
                class="image"
              />
            </view>
          </view>
          <u-loadmore
            v-if="isShowNoMoreTip"
            :status="bottomLoadingState"
            :bg-color="getPageBgColor"
          />
        </view>
      </view>
    </scroll-view>
    <u-empty-custom
      v-else
      v-show="isShowEmptyView"
      text="暂无数据"
      model="list"
      class="content-empty"
    />
  </view>
  <!-- </page> -->
</template>
<script lang="ts" setup>
import { handlePageJumps, timeFormat } from '@/pages/message/utils';
import {
  VisionSelfTesting,
  accessAlarmCode,
  accessNotificationCode,
  attendanceCode,
  behaviorAlarmCode,
  bizAlarmCode,
  bizClockInCode,
  bizPickupCode,
  classroomAttendanceCode,
  consumeCenterAccountCode,
  consumeCenterCardCode,
  dutyRosterCode,
  electronicCardCode,
  faceAlarmCode,
  fireSafetyCode,
  growthEvaluationCode,
  healthCollectionCode,
  healthDayCode,
  homeSchoolCode,
  homeSchoolNoticeCode,
  lessonCancelNoticeCode,
  lessonNoticeCode,
  medicationRegisterCode,
  onekeyAlarm,
  patrolManagementCode,
  reportSubscribeCode,
  resourceNoticeCode,
  retardCode,
  safetyEducationCode,
  schoolBusAlarmCode,
  schoolOverCode,
  sicknessCode,
  siteReservationCode,
  sportsClockinCode,
  studentArchiveCode,
  studentAttendanceCode,
  studentLeaveCode,
  teachingResearchOnlineCode,
  timeImpressionCode,
  visionScreenCode,
  visitorAppointmentCode,
  workOrderCode,
} from '@/pages/message/utils/constant';
import {
  IReadMsgParams,
  ListItem,
  getNotificationList,
  markRead,
  readMsgRequest,
} from '@/services/systemMessages';
import { loginStore } from '@/store/modules/login';
import { messageStore } from '@/store/modules/message';
import { getPageBgColor } from '@/styles/theme/get-config-color';
import { getUnreadNum } from '@/utils/get-unread-num';
import { EUserType } from '@/utils/kind';
import { setAppBadgeNum } from '@/utils/push-jump';
import { clientType, getPageParams } from '@/utils/tools';
import { onShow } from '@dcloudio/uni-app';
import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, reactive, ref } from 'vue';
import icon_broom from '/static/icon_broom.png';

export type MsgItemType = { iconType: string } & ListItem;

/** 数据加载类型 */
export type IDataLoadType = 'new' | 'append';

/** 翻页属性 */
export interface IPager {
  pageNum: number;
  pageSize: number;
  total: number;
}

onShow(() => {
  getUnreadNum();
  uni.$emit('notification-show');
});

const store = loginStore();
const detailClickable = ref(true);
const notificationList: MsgItemType[] = reactive([]);
const pager = reactive({} as IPager);
const isShowEmptyView = ref(false);
const isShowNoMoreTip = ref(false);
const bottomLoadingState = ref('loading');
let msgBizGroupCode = '';
let title = ref('');

let menuButtonInfo = {};
// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
// #ifdef MP-WEIXIN
menuButtonInfo = uni.getMenuButtonBoundingClientRect();
// #endif

const info = uni.getSystemInfoSync();
const marginBottom = info.safeAreaInsets?.bottom || 0;
let navHeight = info.platform == 'ios' ? 44 : 48;
let bodyHeight = `calc(${info.screenHeight}px - ${info.statusBarHeight}px - ${navHeight}px - ${marginBottom}px)`;
// #ifdef H5
bodyHeight = `calc(${info.windowHeight}px - ${info.windowTop}px - ${info.windowBottom}px)`;
// #endif
let leftWidth = 0;
let rightWidth = 0;
// #ifdef MP-WEIXIN
let rightButtonWidth = info.windowWidth - menuButtonInfo.left;
leftWidth = rightButtonWidth - 41;
// #endif
// #ifdef APP-PLUS || H5
rightWidth = 41;
// #endif

// 是否告警图片(人脸布控、行为布控、防疫机告警)
const isShowImg = (item: MsgItemType) => {
  const bizDataJson = JSON.parse(item.bizDataJson || '{}');
  return (
    bizAlarmCode.includes(item.bizCode) &&
    [...faceAlarmCode, ...behaviorAlarmCode, ...accessAlarmCode].includes(
      bizDataJson?.alarmTypeCode,
    )
  );
};

/** 初始化翻页属性 */
const initPager = () => {
  Object.assign(pager, { pageNum: 1, pageSize: 10, total: Infinity });
};

/** 调用接口获取数据 */
const fetchData = async (type: IDataLoadType) => {
  if (type === 'new') {
    isShowNoMoreTip.value = false;
  }
  try {
    const res = await fetchDataFunc(Object.assign({}, pager, { pageNum: pager.pageNum }), type);
    console.log('res : ', res);
    uni.stopPullDownRefresh();
    Object.assign(pager, {
      total: res['total'] || pager.total,
    });
    if (pager.pageNum * pager.pageSize >= pager.total) {
      bottomLoadingState.value = 'nomore';
      isShowNoMoreTip.value = true;
    }
    return res;
  } catch (error: any) {
    uni.stopPullDownRefresh();
    if (type === 'append') {
      Object.assign(pager, {
        pageNum: pager.pageNum - 1,
      });
    }
    return [];
  }
};

// 停止下拉刷新动画
const triggered = ref<boolean>(false);
// 下拉刷新
const handleRefresh = () => {
  triggered.value = true;
  initPager();
  fetchData('new')
    .then(res => {
      console.log('handleRefresh', res);
      setTimeout(() => {
        triggered.value = false;
      }, 500);
    })
    .catch(e => {
      console.log('handleRefresh', e);
      setTimeout(() => {
        triggered.value = false;
      }, 500);
    });
};

// 请求数据
const fetchDataFunc = async (pager: IPager, type: IDataLoadType) => {
  getUnreadNum();
  const { pageSize, pageNum } = pager;
  const tempParams = getPageParams();
  const res = await getNotificationList({
    pageSize,
    pageNum,
    clientType,
    userId: store.userInfo?.userId,
    userType: EUserType.teacher === store.currentUserType ? 1 : 2,
    groupType: tempParams.type,
  });
  // 自定义消息图标
  const data: MsgItemType[] = res.result.map(v => {
    if (bizAlarmCode.includes(v.bizCode)) return { ...v, iconType: 'alarm' };
    if (bizPickupCode.includes(v.bizCode)) return { ...v, iconType: 'pickup' };
    if (bizClockInCode.includes(v.bizCode)) return { ...v, iconType: 'clockIn' };
    if (fireSafetyCode.includes(v.bizCode)) return { ...v, iconType: 'fireSafety' };
    if (studentLeaveCode.includes(v.bizCode)) return { ...v, iconType: 'studentLeave' };
    if (attendanceCode.includes(v.bizCode)) return { ...v, iconType: 'attendance' };
    if (accessNotificationCode.includes(v.bizCode)) return { ...v, iconType: 'accessNotification' };
    if (reportSubscribeCode.includes(v.bizCode)) return { ...v, iconType: 'reportSubscribe' };
    if (schoolBusAlarmCode.includes(v.bizCode)) return { ...v, iconType: 'schoolBus' };
    if (retardCode.includes(v.bizCode)) return { ...v, iconType: 'alarm' };
    if (workOrderCode.includes(v.bizCode)) return { ...v, iconType: 'workOrder' };
    if (healthDayCode.includes(v.bizCode)) return { ...v, iconType: 'healthDay' };
    if (timeImpressionCode.includes(v.bizCode)) return { ...v, iconType: 'timeImpression' };
    if (medicationRegisterCode.includes(v.bizCode)) return { ...v, iconType: 'medicationRegister' };
    if (healthCollectionCode.includes(v.bizCode)) return { ...v, iconType: 'healthCollection' };
    if (studentAttendanceCode.includes(v.bizCode)) return { ...v, iconType: 'studentAttendance' };
    if (classroomAttendanceCode.includes(v.bizCode))
      return { ...v, iconType: 'classroomAttendance' };
    if (homeSchoolCode.includes(v.bizCode)) return { ...v, iconType: 'jiaxiaotongxun' };
    if (homeSchoolNoticeCode.includes(v.bizCode)) return { ...v, iconType: 'homeSchoolNotice' };
    if (growthEvaluationCode.includes(v.bizCode)) return { ...v, iconType: 'growthEvaluation' };
    if (VisionSelfTesting.includes(v.bizCode)) return { ...v, iconType: 'visionSelfTest' };
    if (visitorAppointmentCode.includes(v.bizCode)) return { ...v, iconType: 'visitorAppointment' };
    if (patrolManagementCode.includes(v.bizCode)) {
      return { ...v, iconType: 'patrolManagement' };
    }
    if (dutyRosterCode.includes(v.bizCode)) return { ...v, iconType: 'dutyRoster' };
    if (consumeCenterAccountCode.includes(v.bizCode))
      return { ...v, iconType: 'consumeCenterAccount' };
    if (consumeCenterCardCode.includes(v.bizCode)) return { ...v, iconType: 'consumeCenterCard' };
    if (electronicCardCode.includes(v.bizCode)) return { ...v, iconType: 'electronicCard' };
    if (studentArchiveCode.includes(v.bizCode)) return { ...v, iconType: 'studentArchive' };
    if (lessonNoticeCode.includes(v.bizCode)) return { ...v, iconType: 'lessonNotice' };
    if (lessonCancelNoticeCode.includes(v.bizCode)) return { ...v, iconType: 'lessonCancelNotice' };
    if (onekeyAlarm.includes(v.bizCode)) return { ...v, iconType: 'onekeyAlarm' };
    if (resourceNoticeCode.includes(v.bizCode)) return { ...v, iconType: 'resource' };
    if (safetyEducationCode.includes(v.bizCode)) return { ...v, iconType: 'safetyEducation' };
    if (sportsClockinCode.includes(v.bizCode)) return { ...v, iconType: 'sportsClockin' };
    if (sicknessCode.includes(v.bizCode)) return { ...v, iconType: 'sickness' };
    if (visionScreenCode.includes(v.bizCode)) return { ...v, iconType: 'visionHealth' };
    if (schoolOverCode.includes(v.bizCode)) return { ...v, iconType: 'schoolOver' };
    if (teachingResearchOnlineCode.includes(v.bizCode))
      return { ...v, iconType: 'teachingResearchOnline' };
    if (siteReservationCode.includes(v.bizCode)) return { ...v, iconType: 'siteReservation' };
    return { ...v, iconType: 'inform' };
  });
  if (type === 'new') notificationList.length = 0;
  notificationList.push(...data);
  if (data.length === 0) {
    isShowEmptyView.value = true;
  }
  return res;
};

// 跳转详情，设置已读
const setReadToDetail = async (item: MsgItemType) => {
  // 防止快速点击多条未读消息
  if (!detailClickable.value) return;
  detailClickable.value = false;
  // 根据通知类型处跳转
  handlePageJumps(item);
  if (!item.readStatus) {
    const newList = notificationList.map(v => ({
      ...v,
      readStatus: v.id === item.id ? 1 : v.readStatus,
    }));
    Object.assign(notificationList, newList);
    // 设置为已读
    await markRead(item.id);
    // #ifdef APP-PLUS
    // 更新app角标数量
    await setAppBadgeNum();
    // #endif
    // 获取未读通知数
    await getUnreadNum();
  }
};

const showMarkReadMsg = () => {
  uni.showModal({
    title: '',
    content: '您确定全部标记成已读吗?',
    success: async res => {
      if (res.confirm) {
        // 处理全部已读
        const params = {
          userId: store.userInfo?.userId,
          clientType,
          userType: EUserType.teacher === store.currentUserType ? 1 : 2,
          locationId: store.userInfo?.locationId,
          bizGroupCode: msgBizGroupCode,
        } as IReadMsgParams;
        // 应用消息已读
        try {
          await readMsgRequest(params);
          const newList = notificationList.map(v => ({
            ...v,
            readStatus: 1,
          }));
          notificationList.length = 0;
          Object.assign(notificationList, newList);
          setAppBadgeNum();
        } catch (err: any) {}
      }
    },
  });
};

onBeforeMount(() => {
  const pageParam = getPageParams();
  msgBizGroupCode = pageParam.type;
  title.value = pageParam.typeName;
  // uni.setNavigationBarTitle({ title: pageParam.typeName || '' });
});

onBeforeUnmount(() => {});

const actionNotificationShow = () => {
  detailClickable.value = true;
  if (notificationList && notificationList.length > 0) {
    const store = messageStore();
    if (store.getPendingMsgRead() != 0) {
      notificationList.some(item => {
        if (item.id == Number(store.getPendingMsgRead())) {
          item.readStatus = 1;
          return true;
        }
      });
      store.setPendingMsgRead(0);
    }
  }
};

onMounted(() => {
  uni.$on('notification-show', actionNotificationShow);
  initPager();
  fetchData('new');
});

onUnmounted(() => {
  uni.$off('notification-show', actionNotificationShow);
});

// onPullDownRefresh(() => {
//   console.log('下拉刷新');
//   initPager();
//   fetchData('new');
// });

// onReachBottom(async () => {
//   bottomRefresh();
// });

const bottomRefresh = () => {
  console.log('上拉加载更多');
  console.log('pagerNum : ', pager.pageNum);
  console.log('pageSize : ', pager.pageSize);
  console.log('total : ', pager.total);
  if (pager.pageNum * pager.pageSize >= pager.total) {
    bottomLoadingState.value = 'nomore';
    isShowNoMoreTip.value = true;
    return;
  }
  Object.assign(pager, {
    pageNum: pager.pageNum + 1,
  });
  bottomLoadingState.value = 'loading';
  fetchData('append');
};

const customBack = function () {
  uni.navigateBack({
    fail(result) {
      console.log('fail', result);
    },
  });
};
</script>
<style lang="scss" scoped>
.broom {
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.icon_broom {
  width: 48rpx;
  height: 48rpx;
}

.title {
  @include ellipsis;
  columns: #606266;
  font-weight: bold;
  font-size: 34rpx;
}

.red-dot {
  width: 15rpx;
  height: 15rpx;
  margin-right: 10rpx;
  background-color: #ff0000; /* 红色 */
  border-radius: 50%; /* 圆形 */
}

.content {
  height: 100%;
  position: relative;
  // overflow: scroll; // 使用这个条件会导致无法下滑加载更多
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-color: $ui-color-page-primary;
}
.scroll-content {
  overflow: scroll;
}
.content-empty {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.notification-list-wrapper {
  // min-height: calc(100vh - 200rpx);
  height: 100%;
}
.notification-list {
  padding: 24rpx 32rpx;
  background-color: $ui-color-page-primary;

  .notification-list-item {
    width: 100%;
    padding: 32rpx 0;
    margin-bottom: 24rpx;
    border-bottom: 1px solid #e5e6eb;
    background-color: white;
    border-radius: 16rpx;
    box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.02);
    .content {
      // position: relative;
      // display: flex;
      // width: 100%;
      background-color: white;

      .unread {
        position: absolute;
        left: -28rpx;
        top: 40rpx;
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background: #f53f3f;
      }

      .icon-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: none;
        height: 88rpx;
        width: 88rpx;
        border-radius: 12rpx;
        .icon {
          width: 56rpx;
          height: 56rpx;
        }
      }

      .alarm {
        background: rgba($color: #f53f3f, $alpha: 0.06);
      }

      .pickup {
        background: rgba($color: #f53f3f, $alpha: 0.06);
      }

      .clockIn {
        background: rgba($color: #722ed1, $alpha: 0.06);
      }

      .inform {
        background: rgba($color: #3491fa, $alpha: 0.06);
      }

      .content-right {
        width: 100%;
        padding-left: 24rpx;
        padding-right: 24rpx;
        background-color: white;
        .main-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24rpx;
          .title {
            flex: 1;
            font-size: 34rpx;
            color: #1d2129;
            line-height: 34rpx;
            @include ellipsis;
          }
          .time {
            font-size: 24rpx;
            color: #86909c;
            letter-spacing: 0;
            line-height: 24rpx;
          }
        }
        .detail {
          font-size: 26rpx;
          color: #86909c;
          line-height: 36rpx;
        }
      }
    }
    .image {
      margin: 32rpx 0 0 32rpx;
      width: 622rpx;
      height: 360rpx;
      border-radius: 12rpx;
    }
  }
  :last-child {
    border: unset;
  }

  .read-status {
    color: #d7d7d7;
    border-color: #e5e6eb;
    background: rgba(255, 255, 255, 1);
    & .content {
      & .content-right {
        & .detail {
          color: #b7b7b7;
        }
        & .main-info {
          & .title {
            color: #b7b7b7;
          }
          & .time {
            color: #b7b7b7;
          }
        }
      }
    }
  }
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 30rpx;
  color: white;
  height: 64rpx;
}
</style>
