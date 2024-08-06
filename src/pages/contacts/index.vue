<template>
  <page>
    <view v-if="!justTeacher && !edu" class="tabs">
      <u-tabs
        v-model="actionIndex"
        :list="tabsTitle"
        :is-scroll="false"
        item-width="140"
        font-size="34"
        @change="handleChangeTab"
      ></u-tabs>
    </view>

    <view v-if="actionIndex == 0" class="input-content" style="margin-bottom: 7rpx">
      <view class="search-content" style="position: relative; z-index: 2">
        <u-search
          v-model="stuKeyword"
          shape="square"
          placeholder="学生姓名/姓名首拼/学籍号"
          :clearabled="true"
          :show-action="false"
          height="72"
          color="#000000E0"
          search-icon-color="#00000073"
          placeholder-color="#00000073"
          @change="onStuInputChange"
          @blur="onSearchBlur"
        ></u-search>
        <ApplyTip @onApplyTipShow="handleApplyTipShown($event)" />
      </view>

      <!-- test -->
      <scroll-view
        :scroll-y="true"
        :style="{ height: scrollH + 'px' }"
        :scroll-into-view="scrollViewId"
        @scroll="searchScrollEvt"
      >
        <CollapseStudent
          v-if="!searchState"
          :list="clazz.array"
          :state-search="false"
          :empty-shown="emptyShown"
          @oninvitePopShow="handleInvitePopShown"
          @eventScrollIntoIndex="updateScrollInto"
        />
        <CollapseStudent
          v-else
          :list="stuSearchResultClazz.array"
          :state-search="true"
          :empty-shown="searchEmptyShown"
        />
        <view style="height: 24rpx" />
      </scroll-view>

      <!-- <view class="scroller-parent" :style="{ height: scrollH + 'px' }">
        <scroll-view class="scroller-content" :scroll-y="true">
          <CollapseStudent
            v-if="!searchState"
            :list="clazz.array"
            :state-search="false"
            :empty-shown="emptyShown"
          />
          <CollapseStudent
            v-else
            :list="stuSearchResultClazz.array"
            :state-search="true"
            :empty-shown="searchEmptyShown"
          />
          <view style="height: 24rpx" />
        </scroll-view>
      </view> -->
    </view>
    <view v-if="actionIndex == 1" class="input-content">
      <view class="search-content">
        <u-search
          v-model="teachKeyword"
          shape="square"
          placeholder="姓名/姓名首拼/手机/部门"
          :clearabled="true"
          :show-action="false"
          height="72"
          color="#000000E0"
          search-icon-color="#00000073"
          placeholder-color="#00000073"
          @change="onTeachInputChange"
          @search="onTeachSearch"
        ></u-search>
      </view>
      <TeacherContact :has-tab-bar="!justTeacher" />
    </view>
    <u-tabbar
      v-if="!isNativeTabBar"
      inactive-color="#000000a6"
      :list="currentTabBar"
      :active-color="primaryColor"
    ></u-tabbar>
  </page>

  <u-popup
    v-model="showPopup"
    mode="bottom"
    :safe-area-inset-bottom="true"
    border-radius="16"
    :closeable="false"
    height="460rpx"
  >
    <view class="popup-head">
      <view class="popup-title">
        <text class="cancel" @click="cancel">取消</text>
        <text class="title">选择验证方式</text>
        <button
          v-if="shareInApp"
          class="confirm"
          :plain="true"
          style="border: none"
          open-type="share"
          @click="confirm"
          @getphonenumber="_onGetphonenumber"
        >
          确定
        </button>

        <button
          v-else
          class="confirm"
          :plain="true"
          style="border: none"
          open-type="share"
          @getphonenumber="_onGetphonenumber"
        >
          确定
        </button>
      </view>
      <u-line class="u-line" color="#0000000f"></u-line>
    </view>
    <view :style="{ height: 16 + 'rpx' }"></view>
    <u-cell-group title="选择验证方式" :border-bottom="false">
      <u-cell-item
        v-for="(item, inx) in inviteItems"
        :key="item.id"
        :title="item.text"
        :label="item.desc"
        :arrow="false"
        :border-bottom="false"
        :border-top="false"
        :title-style="{ fontSize: '32rpx', color: '#000000E0' }"
        :label-style="{ fontSize: '26rpx', color: '#00000073' }"
        @click="choiceVar(inx)"
      >
        <template #right-icon>
          <u-icon v-if="item.check" name="checkmark" color="#176bfb" size="48"></u-icon>
        </template>
      </u-cell-item>
    </u-cell-group>
  </u-popup>
</template>

<script lang="ts" setup>
import {
  IStuContact,
  createInviteToClazz,
  getSchoolNameByLocationId,
  searchByKeyword,
} from '@/services/contact';
import { contactStore } from '@/store/modules/contacts';
import { InviteParams, inviteStore } from '@/store/modules/invite';
import { loginStore } from '@/store/modules/login';
import { tabBarStore } from '@/store/modules/tabbar';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { Server_Asset_Prefix } from '@/utils/constant';
import { EnvType, TEnvType } from '@/utils/env';
import { debounce } from '@/utils/lodash-es';
import { isEdu, log, showInfo } from '@/utils/tools';
import track from '@/utils/track';
import { onShareAppMessage, onShow } from '@dcloudio/uni-app';
import { onBeforeMount, onMounted, onUnmounted, reactive, ref, toRefs, watch } from 'vue';
import ApplyTip from './components/apply-tip/index.vue';
import CollapseStudent from './components/collapse-student/index.vue';
import TeacherContact from './components/teacher-contact/index.vue';
import { shareInviteTask } from './invite-share';

const edu = ref(isEdu());
const shareInApp = ref(true);
type IShare = Pick<InviteParams, 'id' | 'locationId' | 'title'>;
// #ifdef MP-WEIXIN
// shareInApp.value = false;
onShareAppMessage(() => {
  cancel();
  const invStore = inviteStore();
  const task: IShare = {
    id: invStore.inviteParams.id,
    locationId: invStore.inviteParams.locationId,
    title: invStore.inviteParams.title,
  };
  let _shareData = shareInviteTask(task);
  console.log('shareData===>', _shareData);
  return _shareData;
});
// #endif

const { isNativeTabBar, currentTabBar } = toRefs(tabBarStore());
const primaryColor = getPrimaryColor();

// 取环境类型
const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;

// scrollview滚动位置
const scrollViewId = ref('');
// 邀请家长
const showPopup = ref(false);
const inviteItems = ref([] as any[]);
const currentInviteItemIndex = ref(-1);
// tabs
const tabsTitle = ref([{ name: '学生' }, { name: '教职工' }]);
// 选中tab
const actionIndex = ref(0);
const justTeacher = ref(false);

const handleInvitePopShown = (inx: number, clazzId: string) => {
  log('handleInvitePopShown -> index : ' + inx + ', clazzId : ' + clazzId);
  currentInviteItemIndex.value = inx;
  showPopup.value = true;
  choiceVar(0);
};

const updateScrollInto = (itemId: string) => {
  log('updateScrollInto -> itemId : ', itemId);
  scrollViewId.value = itemId;
};

const cancel = () => {
  showPopup.value = false;
};

const _onGetphonenumber = (e: any) => {
  uni.$emit('getphonenumber', e);
};

const confirm = () => {
  log('currentInviteItemIndex : ' + currentInviteItemIndex.value);
  if (!inviteItems.value.some(s => s.check)) {
    showInfo('请选择邀请方式');
    return;
  }
  showPopup.value = false;
  const inx = inviteItems.value.findIndex(tmp => tmp.check);
  const clzDetail = clazz.array[currentInviteItemIndex.value].collapseItem;
  // uni.navigateTo({ url: '/app-platform/contacts/register-form/index' });
  log('confirm -> clzDetail : ', clzDetail);
  handleInviteParent(inx, clzDetail);
};
/**
 * 邀请方式发生变化
 * @param index
 */
const choiceVar = async (index: number) => {
  inviteItems.value.map((item, inx) => (item.check = index == inx));
  //每次用户触发更新-重新生成待分享数据
  if (currentInviteItemIndex.value === -1) {
    showInfo('请选择邀请方式');
    return;
  }
  // ******** 开始准备生成微信分享所需要的日志数据****************
  //获取需要的班级id
  const inx = inviteItems.value.findIndex(tmp => tmp.check);
  const clzDetail = clazz.array[currentInviteItemIndex.value].collapseItem;
  //获取班级id
  const _inviteToClazzId = await createInviteToClazz({
    clazzId: clzDetail.id,
    needApprove: inx,
  });
  //生成需要分享的标题
  const { schoolName, name } = clzDetail;
  let requestSchoolName = schoolName;
  try {
    requestSchoolName = await getSchoolNameByLocationId(store.userInfo?.locationId || '');
  } catch (error: any) {
    console.error('获取组织单位发生异常：', error);
  }
  const title = `邀请您加入${requestSchoolName}${name}`;
  //生成LocationID
  const _locationId = store.userInfo?.locationId;

  const invStore = inviteStore();
  invStore.setInviteParams({
    id: _inviteToClazzId,
    inviteType: '3',
    locationId: _locationId,
    params: `id=${_inviteToClazzId}&locationId=${_locationId}&inviteType=3`,
    title: title,
  });
  console.log('生成的邀请信息为：', invStore.inviteParams);
};

// tab切换
const handleChangeTab = (idx: number) => {
  loadDataWhenTabChange(idx);
  actionIndex.value = idx;
  uni.setStorage({ key: 'contactTabIndex', data: actionIndex.value });
};

// store
const contactSt = contactStore();
const store = loginStore();

const handleJump = (id: string) => {
  uni.navigateTo({
    url: `/app-platform/contacts/student-detail?id=${id}`,
  });
};

const handleApplyTipShown = (isShow: boolean) => {
  log('handleApplyTipShown : ', isShow);
  initScrollH();
  // 页面切换回通讯录时刷新当前登录的权限数据
  if (!searchState.value) {
    fetchClazz();
  }
  if (isShow) {
    // #ifdef APP-PLUS || MP-WEIXIN
    scrollH.value = scrollH.value - uni.upx2px(85);
    // #endif
    // #ifdef H5
    scrollH.value = scrollH.value - uni.upx2px(65);
    // #endif
  }
};

/** 邀请注册 */
const handleInviteParent = async (inx: number, clzDetail: any) => {
  log('handleInviteParent -> needApprove_inx and clzDetail : ', inx, clzDetail);
  const { schoolName, name } = clzDetail;
  let requestSchoolName = schoolName;
  try {
    requestSchoolName = await getSchoolNameByLocationId(store.userInfo?.locationId || '');
  } catch (error: any) {}
  log('handleInviteParent -> requestSchoolName : ', requestSchoolName);
  const inviteToClazzId = await createInviteToClazz({
    clazzId: clzDetail.id,
    needApprove: inx,
  });
  log('handleInviteParent -> id : ', inviteToClazzId);
  const title = `邀请您加入${requestSchoolName}${name}`;
  const params = `id=${inviteToClazzId}&locationId=${store.userInfo?.locationId}&inviteType=3`;

  // #ifdef MP-WEIXIN
  const {
    miniProgram: { appId },
  } = uni.getAccountInfoSync();
  log('appId handleInviteParent -> ', appId);
  const relatedGuardianAppId = import.meta.env.VITE_WX_APP_ID;
  if (!relatedGuardianAppId) {
    showInfo('未配置关联的小程序');
    return;
  }
  const envVersion =
    ([EnvType.EnvType_PROD, EnvType.EnvType_PRE].includes(VITE_SERVER_ENV) && 'release') ||
    (VITE_SERVER_ENV === EnvType.EnvType_DEV && 'develop') ||
    'trial';
  log(
    'handleInviteParent -> relatedGuardianAppId : ',
    relatedGuardianAppId,
    title,
    params,
    envVersion,
  );
  // 新基座无麦塔校园小程序，固直接跳邀请
  const inviteParams = {
    id: inviteToClazzId,
    locationId: store.userInfo?.locationId,
    inviteType: 3,
  };

  //直接拉起微信分享 不用跳转到邀请页面，直接在这边拉起微信好友分享
  const _inviteStore = inviteStore();
  _inviteStore.setInviteParams({
    id: inviteToClazzId,
    inviteType: '3',
    locationId: inviteParams.locationId,
    params: `id=${inviteToClazzId}&locationId=${store.userInfo?.locationId}&inviteType=3`,
    title: title,
  });

  // #endif

  // #ifdef APP-PLUS
  // 检查是否安装了微信
  if (!plus.runtime.isApplicationExist({ pname: 'com.tencent.mm', action: 'weixin://' })) {
    showInfo('您的手机尚未安装微信');
    return;
  }
  const envTypeMap: Record<TEnvType, 0 | 1 | 2> = {
    PROD: 0,
    DEV: 1,
    TEST: 2,
    TEST2: 2,
    TEST3: 2,
    PRE: 0, // 转到正式版
  };
  const envType = envTypeMap[VITE_SERVER_ENV];
  const appid = plus.runtime.appid;
  if (!appid) {
    showInfo('找不到appid');
    return;
  }
  const timestamp = new Date().getTime();
  log('handleInviteParent -> title : ', title);
  const opt: UniApp.ShareOptions = {
    provider: 'weixin',
    type: 5,
    title,
    imageUrl: `${Server_Asset_Prefix}img_invite.png`,
    scene: 'WXSceneSession',
    miniProgram: {
      id: import.meta.env.VITE_WX_ID,
      path: `/app-platform/contacts/register-form/index?${params}&timestamp=${timestamp}`,
      type: envType,
      webUrl: import.meta.env.VITE_APP_OFFICIA_URL,
    },
    success(result) {
      log('🚀 ~ file: class-files.vue ~ line 215 ~ success ~ result' + JSON.stringify(result));
    },
    fail(e) {
      log('🚀 ~ file: class-files.vue ~ line 218 ~ fail ~ e' + JSON.stringify(e));
    },
  };
  uni.share(opt);
  // #endif
};

const initScrollH = () => {
  let safeArea = uni.getSystemInfoSync().safeAreaInsets?.bottom;
  log('initScrollH -> safeArea : ', safeArea);
  // let screenH = uni.getSystemInfoSync().screenHeight; // 单位rpx
  let screenH = uni.getSystemInfoSync().windowHeight; // 单位px（不包括手机通知栏、小程序标题栏和tabBar）的高度
  log('initScrollH -> screenH : ', screenH);
  log('initScrollH -> isNativeTabBar : ', isNativeTabBar.value);
  scrollH.value =
    screenH -
    uni.upx2px(88) -
    uni.upx2px(76) -
    uni.upx2px(24) -
    (!isNativeTabBar.value ? uni.upx2px(100) : 0) -
    (safeArea ? safeArea : 0); // windowHeight - 头部tabBar - searchBar - 自定义底部tabBar
};

// 学生搜索内容
const stuKeyword = ref('');
const searchState = ref(false);
// 教职工搜索内容
const teachKeyword = ref('');

// 存放总班级+学生
const clazz = reactive({ array: [] as IStuContact[] });
const emptyShown = ref(false);
const searchEmptyShown = ref(false);
const isPendingSwitchIdentity = ref(false);

// 存放搜索后的班级+学生
const stuSearchResultClazz = reactive({ array: [] as IStuContact[] });

const loadDataWhenTabChange = (idx: number) => {
  log('loadDataWhenTabChange -> tabIndex : ', idx);
};

/**
 * 身份切换后需要将搜索数据进行清空
 */
const switchIdentityThenInit = () => {
  log('switchIdentityThenInit');
  isPendingSwitchIdentity.value = true;
  //涉及到身份切换，搜索需要进行重置
  teachKeyword.value = '';
  uni.$emit('action-teach-search', { teachKeyword: teachKeyword.value });
};

const fetchClazz = async () => {
  console.log('fetchClazz');
  clazz.array.length = 0;
  try {
    const res = await contactSt.getClazzListData();
    clazz.array.length = 0;
    console.log('fetchClazz -> res : ', res);
    // 是否展示学生通讯录
    if (res.length === 0) {
      console.log('fetchClazz -> 无班级列表');
      justTeacher.value = true;
      actionIndex.value = 1;
      return;
    } else if (!edu.value && res.length) {
      console.log('fetchClazz -> 有班级列表且是校端');
      justTeacher.value = false;
      actionIndex.value = 0;
    } else {
      justTeacher.value = false;
      actionIndex.value = 1;
    }
    console.log('🚀 ~ fetchClazz ~ justTeacher.value:', justTeacher.value);
    console.log('🚀 ~ fetchClazz ~ actionIndex.value:', actionIndex.value);

    let expendIndex = -1;
    let expendClzId = '';
    res.forEach((item, index) => {
      // 从缓存中读取上次打开状态的item
      const isExpend = getItemExpendState() ? getItemExpendState() == item.id : false;
      if (isExpend) {
        expendIndex = index;
        expendClzId = item.id;
      }
      clazz.array.push({
        collapseItem: item,
        isExpense: isExpend,
        isShowLoading: true, // 默认局部加载
        childItems: [],
      });
    });

    // 如果有数据显示, 没数据显示“暂无数据”
    if (clazz.array.length > 0) {
      // 如果首次没有保存展开项，展开第一项
      if (!expendClzId || expendIndex == -1) {
        log('fetchClazz -> 首次没有保存展开项，展开第一项');
        expendClzId = res[0].id;
        expendIndex = 0;
        clazz.array[0].isExpense = true;
      }

      uni.$emit('fetchClazzFile', {
        expendClzId: expendClzId,
        expendIndex: expendIndex,
      });
    } else {
      emptyShown.value = true;
    }
  } catch (e: any) {
    log('fetchClazz -> 获取班级列表出错：', e);
  }
};

const handleJoinClassCallback = async () => {
  fetchClazz();
};

// ====== 教职工搜索 ======//
const onTeachInputChange = () => {
  log('onTeachInputChange');
  //当数据发生变化
  uni.$emit('action-teach-search', { teachKeyword: teachKeyword.value });
};
const onTeachSearch = () => {
  log('onTeachSearch');
  //回车或者输入法的搜索
  uni.$emit('action-teach-search', { teachKeyword: teachKeyword.value });
};

// ====== 学生搜索 ====== //
const onStuInputChange = () => {
  initScrollH();
  log('onStuInputChange');
  //当数据发生变化(暂时不用，搜索太频繁)
  if (store.userInfo?.locationId && stuKeyword.value) {
    actionSearchByKeyword();
  }
  if (!stuKeyword.value) {
    searchState.value = false;
  }
};
// const onStuSearch = () => {
//   log('onStuSearch');
//   //回车或者输入法的搜索
//   if (userInfo?.locationId && stuKeyword.value) {
//     actionSearchByKeyword();
//   }
//   if (!stuKeyword.value) {
//     searchState.value = false;
//   }
// };

const onSearchBlur = () => {
  console.log('搜索框---》失去焦点===>隐藏键盘');
  uni.hideKeyboard();
};

const actionSearchByKeyword = debounce(async function () {
  console.log('🚀 ~ actionSearchByKeyword ~ userInfo?.locationId:', store.userInfo?.locationId);
  console.log('🚀 ~ actionSearchByKeyword ~ stuKeyword.value:', stuKeyword.value);

  const res = await searchByKeyword(store.userInfo?.locationId || '', stuKeyword.value);
  // if (res && res.length > 0) {
  searchState.value = true;
  // 从clazz中过滤出搜索结果
  log('clazz.array : ' + JSON.stringify(clazz.array));
  const filters = clazz.array.filter(item => res.some(s => s.clazzId == item.collapseItem?.id));
  log('filterRes : ' + JSON.stringify(filters));
  const searchResultClazz = filters.map(item => {
    let inx = res.findIndex(s => s.clazzId == item.collapseItem?.id);
    return {
      isExpense: true,
      collapseItem: { ...item.collapseItem, studentCount: res[inx].studentReList?.length },
      childItems: res[inx].studentReList,
    };
  });
  log('searchResultClazz : ' + JSON.stringify(searchResultClazz));
  // Object.assign(stuSearchResultClazz.array, searchResultClazz);
  stuSearchResultClazz.array = searchResultClazz as IStuContact[];
  // }
  searchEmptyShown.value = stuSearchResultClazz.array.length === 0;
}, 600);

const getItemExpendState = () => {
  let value = '';
  try {
    value = uni.getStorageSync('expend') || '';
  } catch (error) {
    log('getItemExpendState -> error : ', error);
  }
  return value;
};

const scrollH = ref(0);

onShow(() => {
  edu.value = isEdu();
  // #ifdef APP-PLUS
  plus.screen.lockOrientation('portrait-primary');
  // #endif
  if (actionIndex.value == 0) {
    uni.$emit('ApplyTipOnShow');
  }

  // 切换组织后需要等到show出来才能刷新UI
  if (isPendingSwitchIdentity.value) {
    isPendingSwitchIdentity.value = false;
    contactSt.updateSwitchOrg(true);
    actionIndex.value = 0;
    fetchClazz();
  }
  if (!(!justTeacher.value && !edu.value)) {
    actionIndex.value = 1;
  }
});

onBeforeMount(() => {
  inviteItems.value = [
    {
      id: '1',
      text: '加入班级免验证',
      desc: '自动同意入班申请，安全方便',
      check: true,
    },
    {
      id: '2',
      text: '加入班级时需要验证',
      desc: '入班申请需要审核，更安全',
      check: false,
    },
  ];
});

onMounted(() => {
  log('onMounted -> primaryColor : ', getPrimaryColor());
  uni.$on('switchIdentitySuccess', switchIdentityThenInit);
  uni.$on('joinClassUpdateStudent', handleJoinClassCallback);
  // uni.$on('actionTeachSearchReset',)
  fetchClazz();
  initScrollH();
  if (!(!justTeacher.value && !edu.value)) {
    actionIndex.value = 1;
  }
  track('pageview', { appCode: 'contacts' });
});

onUnmounted(() => {
  uni.$off('switchIdentitySuccess', switchIdentityThenInit);
  uni.$off('joinClassUpdateStudent', handleJoinClassCallback);
});

watch(actionIndex, () => {
  if (actionIndex.value == 1) {
    teachKeyword.value = '';
    uni.$emit('action-teach-search', { teachKeyword: teachKeyword.value });
  }
});

/**
 * 搜索 -列表栏滚动
 */
const searchScrollEvt = e => {
  //log('[搜索列表]  滚动中.....');
  uni.hideKeyboard();
};
</script>

<style scoped lang="scss">
.tabs {
  height: 88rpx;
  display: flex;
  background-color: white;
}

.input-content {
  height: 100%;
  .search-content {
    padding: 0rpx 32rpx 32rpx 32rpx;
    background-color: white;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
  }
}

.popup-head {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  background-color: white;
  z-index: 3;
  .popup-title {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    font-size: 32rpx;
    font-weight: 500;
    .cancel {
      padding-left: 32rpx;
      color: #000000a6;
      font-size: 32rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 48px;
    }

    .confirm {
      padding-right: 32rpx;
      color: $ui-color-primary;
      font-size: 32rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 48rpx;
    }

    .title {
      flex: 1;
      text-align: center;
      font-size: 32rpx;
      font-style: normal;
      font-weight: 500;
      line-height: 48rpx;
      color: #000000e0;
    }
  }
}

.scroller-parent {
  display: flex;
  flex-direction: column;
  .scroller-content {
    flex: 1;
    height: 0;
    width: 100%;
    // height: calc(100vh - var(--window-top) - 88rpx - 100rpx);
  }
}

.custom-button {
  margin-top: 48rpx;
  height: 104rpx;
  color: white;
  font-size: 34rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 16rpx;
  background: $ui-color-primary;
}
.forget-pwd {
  margin: 24rpx 48rpx 0rpx;
  position: relative;
  height: 48rpx;

  text {
    position: absolute;
    right: 0;
    font-size: 34rpx;
    color: $ui-color-primary;
  }
}
.protocol {
  color: #00000073;
  font-size: 30rpx;
  margin: 48rpx 48rpx;
  display: flex;
  .radio {
    transform: scale(0.8);
  }
  .protocol-content {
    flex: 1;
  }
}

.color-primary {
  color: $ui-color-primary;
}

.color-primary-disable {
  background: #91caff;
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
