<template>
  <page
    custom-overflow="visible"
    :custom-style="{ backgroundColor: 'transparent' }"
    :class="[isIOSTerminal ? 'pageHeight' : '']"
  >
    <custom-bg :bg-color="bgColor"></custom-bg>
    <u-sticky
      :h5-nav-height="0"
      bg-color="#00000000"
      z-index="999"
      :content-width="'750rpx'"
      @fixed="fixed"
      @unfixed="unfixed"
    >
      <custom-navbar
        :bg-color="isFixed ? bgColorOpacity : '#00000000'"
        :class="[isFixed ? 'navAnnimation' : '']"
      ></custom-navbar>
    </u-sticky>
    <view
      v-if="isFixed && opacity >= 1"
      :style="{
        width: '100%',
        height: 24 + 'rpx',
        position: 'fixed',
        top: navHeight + 'px',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
        zIndex: 991,
        transition: `opacity 1s ease`,
      }"
    ></view>
    <notification></notification>
    <frequent-function v-if="isShowNavigation" :list="favoriteApplications"></frequent-function>
    <custom-banner v-if="isShowBanner"></custom-banner>
    <widget-list v-if="isShowWidget"></widget-list>
    <workbench-set v-if="isShowWidget"></workbench-set>
    <view v-if="!isShowNavigation && !isShowBanner && !isShowWidget" class="empty">
      <u-empty-custom text="暂无数据" mode="data"></u-empty-custom>
    </view>
    <view :style="{ height: '36rpx' }"></view>
    <!-- #ifdef APP-PLUS || H5 -->
    <view v-if="!isNativeTabBar" :style="{ height: '100rpx' }"></view>
    <!--#endif-->
    <!--#ifdef MP-WEIXIN-->
    <view v-if="hasFollowOfficialAccounts === 0" style="height: 120rpx"></view>
    <follow v-if="hasFollowOfficialAccounts === 0"></follow>
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
import { commConfig } from '@/js-bridge/call-native-x5';
import moreIcon from '@/static/workbench/workbench_more.svg';
import { ETerminal } from '@/store/modules/env';
import { LocationType, loginStore } from '@/store/modules/login';
import { tabBarStore } from '@/store/modules/tabbar';
import { treePermissionsStore } from '@/store/modules/treePermissions';
import {
  ETargetType,
  EWorkbenchLayoutType,
  ILayout,
  workbenchStore,
  type IApplication,
} from '@/store/modules/workbench';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { getUnreadNum } from '@/utils/get-unread-num';
import { TResolveCallback, handleShareLink } from '@/utils/handle-share-link';
import { EUserType } from '@/utils/kind';
import { defaultFailText } from '@/utils/request';
import { handleSchemaJump } from '@/utils/schema-jump';
import { showInfo } from '@/utils/tools';
import track from '@/utils/track';
import { onLoad, onPageScroll, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, toRefs, watchEffect } from 'vue';
import widgetList from '../../widgets/widget-list.vue';
import customBanner from './components/custom-banner.vue';
import customBg from './components/custom-bg.vue';
import customNavbar from './components/custom-navbar.vue';
import follow from './components/follow.vue';
import frequentFunction from './components/frequent-function.vue';
import notification from './components/notification.vue';
import workbenchSet from './components/workbench-set.vue';

const store = loginStore();
// 窗口顶部背景颜色值
const bgColorTop = ref<string>('');
// 背景渐变色
const bgColor = ref<string>('');
// 渐变
const opacity = ref<number>(0);
// 导航栏背景色
const navBgColor = ref<string>('rgba(255, 255, 255,');
// 导航栏背景颜色渐变
const bgColorOpacity = computed(() => {
  return `${navBgColor.value}${opacity.value})`;
});
// 状态栏+导航栏高度
const navHeight = (uni.getSystemInfoSync().statusBarHeight ?? 0) + 52;
// 解决iOS兼容性问题（部分机型需要超过一屏才可以）
const isIOSTerminal = store.currentEnv.terminal === ETerminal.iOS;

const primaryColor = getPrimaryColor();
const { isNativeTabBar, currentTabBar } = toRefs(tabBarStore());
const { bannerList, workbench, hasFollowOfficialAccounts } = toRefs(workbenchStore());
const { currentUserType, currentOrganization } = toRefs(loginStore());

const isShowNavigation = computed(() => {
  const layout: ILayout | undefined = findLayout(EWorkbenchLayoutType.Navigation);
  return layout?.enable;
});
const isShowBanner = computed(() => {
  const layout: ILayout | undefined = findLayout(EWorkbenchLayoutType.Banner);
  return layout?.enable && bannerList.value.length > 0;
});
const isShowWidget = computed(() => {
  const layout: ILayout | undefined = findLayout(EWorkbenchLayoutType.Widget);
  return layout?.enable && workbench.value.widgets?.length > 0;
});

const findLayout = (type: EWorkbenchLayoutType) => {
  const layout: ILayout | undefined = workbench.value.layouts?.find(item => item.code === type);
  return layout;
};

const refreshData = (applicationCallback?: TResolveCallback) => {
  if (store.authInfo?.accessToken) {
    workbenchStore().fetchBannersData(true);
    workbenchStore().fetchFavoriteApplicationData(true);
    workbenchStore().fetchWorkbenchData(true);
    workbenchStore()
      .fetchApplicationCategorysData(false)
      .then(res => {
        if (applicationCallback) {
          applicationCallback(true);
        }
      })
      .catch(err => {
        if (applicationCallback) {
          applicationCallback(false);
        }
      });
    treePermissionsStore().fetchTreePermissions();
  } else {
    uni.reLaunch({ url: '/app-platform/login/index' });
  }
};

const updateBackgroundColorTop = () => {
  // #ifdef APP-PLUS
  var pages = getCurrentPages();
  var page = pages[pages.length - 1];
  var currentWebview = page.$getAppWebview ? page.$getAppWebview() : null;
  currentWebview?.setStyle({ backgroundColorTop: bgColorTop.value });
  // #endif
  // #ifdef MP-WEIXIN
  setTimeout(() => {
    uni.setBackgroundColor({
      backgroundColorTop: bgColorTop.value,
    });
  }, 1000);
  // #endif
};

const favoriteApplications = computed(() => {
  const list = workbenchStore().favoriteApplicationList || [];
  const favoriteApplicationList: IApplication[] = list.slice(0, 7);
  const moreApplication: IApplication = {
    id: '0',
    code: '',
    icon: moreIcon,
    name: '全部',
    target: ETargetType.TargetTypeAllApplication,
    path: '/app-platform/workbench/application-center',
  };
  favoriteApplicationList.push(moreApplication);
  return favoriteApplicationList;
});

// 停止下拉刷新动画
const triggered = ref<boolean>(false);

// 下拉刷新
const handleRefresh = () => {
  triggered.value = true;
  Promise.all([
    workbenchStore().fetchBannersData(false),
    workbenchStore().fetchFavoriteApplicationData(false),
    workbenchStore().fetchWorkbenchData(false),
    workbenchStore().fetchApplicationCategorysData(false),
    treePermissionsStore().fetchTreePermissions(),
    // #ifdef MP-WEIXIN
    workbenchStore().fetchFollowState(),
    // #endif
  ])
    .then(res => {
      console.log('handleRefresh', res);
      triggered.value = false;
      uni.stopPullDownRefresh();
    })
    .catch(e => {
      console.log('handleRefresh', e);
      showInfo(defaultFailText(e));
      triggered.value = false;
      uni.stopPullDownRefresh();
    });
};

onLoad(() => {
  refreshData((success: boolean) => {
    if (success) {
      // #ifdef APP-PLUS
      // 处理分享链接
      handleSchemaJump();
      // #endif

      // #ifdef MP-WEIXIN
      handleShareLink();
      // #endif
    }
  });
  commConfig();
});
onShow(() => {
  // #ifdef APP-PLUS
  plus.screen.lockOrientation('portrait-primary');
  // #endif
  // #ifdef MP-WEIXIN
  workbenchStore().fetchFollowState();
  // #endif
  uni.$emit('workbenchShow');
});
onBeforeMount(() => {
  uni.$on('switchIdentitySuccess', refreshData);
  uni.$on('workbenchRefreshData', refreshData);
});
onBeforeUnmount(() => {
  uni.$off('switchIdentitySuccess', refreshData);
  uni.$off('workbenchRefreshData', refreshData);
});
onMounted(() => {
  getUnreadNum();
  updateBackgroundColorTop();
  track('pageview', { appCode: 'workbench' });
});
onPullDownRefresh(() => {
  console.log('refresh');
  uni.$emit('workbencPullDownRefresh');
  handleRefresh();
});
watchEffect(() => {
  if (currentOrganization.value?.locationType === LocationType.PreSchool) {
    if (currentUserType.value === EUserType.teacher) {
      navBgColor.value = 'rgba(194, 236, 168,';
      bgColorTop.value = '#95DE64';
      bgColor.value = 'linear-gradient(180deg, #95DE64 5.19%, rgba(148, 232, 109, 0) 100%)';
    } else {
      navBgColor.value = 'rgba(252, 230, 173,';
      bgColorTop.value = '#FFD666';
      bgColor.value = 'linear-gradient(180deg, #FFD666 0%, rgba(255, 214, 102, 0) 100%)';
    }
  } else if (currentOrganization.value?.locationType === LocationType.SecondaryVocational) {
    if (currentUserType.value === EUserType.teacher) {
      navBgColor.value = 'rgba(162, 231, 196,';
      bgColorTop.value = '#5AD898';
      bgColor.value = 'linear-gradient(180deg, #5AD898 5.19%, rgba(90, 216, 152, 0) 100%)';
    } else {
      navBgColor.value = 'rgba(165, 181, 252,';
      bgColorTop.value = '#5574FF';
      bgColor.value = 'linear-gradient(180deg, #5574FF 0%, rgba(85, 116, 255, 0) 100%)';
    }
  } else {
    if (currentUserType.value === EUserType.teacher) {
      navBgColor.value = 'rgba(185, 202, 253,';
      bgColorTop.value = '#85A5FF';
      bgColor.value = 'linear-gradient(180deg, #85A5FF 5.19%, rgba(133, 165, 255, 0) 100%)';
    } else {
      navBgColor.value = 'rgba(172, 210, 252,';
      bgColorTop.value = '#69B1FF';
      bgColor.value = 'linear-gradient(180deg, #69B1FF 5.19%, rgba(105, 177, 255, 0) 100%)';
    }
  }
  updateBackgroundColorTop();
});

const isFixed = ref<boolean>(false);
const fixed = () => {
  isFixed.value = true;
};
const unfixed = () => {
  isFixed.value = false;
};
onPageScroll(e => {
  if (e.scrollTop <= 52) {
    opacity.value = e.scrollTop / 52.0;
  } else {
    opacity.value = 1;
  }
});
</script>
<style scoped lang="scss">
.pageHeight {
  min-height: calc(100vh + 1rpx);
}

.empty {
  width: 100%;
  height: 80%;
}

:deep(.uni-noticebar) {
  padding: 12rpx 24rpx;
  border-radius: $radius_base;
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

:deep(.u-card) {
  border-radius: 16rpx !important;
}

:deep(.u-swiper-title) {
  font-size: 30rpx !important;
  font-weight: 500 !important;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.24) 65.9%) !important;
  padding: 16rpx 16rpx !important;
}

:deep(.u-indicator-item-round) {
  width: 8rpx !important;
  height: 8rpx !important;
  margin: 0 4rpx !important;
  background-color: #ffffff8c !important;
}

:deep(.u-indicator-item-round-active) {
  width: 24rpx !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
}

:deep(u-swiper-indicator) {
  background-color: red !important;
  padding-bottom: 50rpx !important;
}

// :deep(.u-grid-item-box) {
//   padding: 24rpx 0 0 !important;
// }

.navAnnimation {
  transition: 'opacity 1s ease';
}
</style>
