import { getFilterCode } from '@/pages/message/utils';
import { getUnreadNumByUserFilter, IUnreadNumParamsFilter } from '@/services/systemMessages';
import { loginStore } from '@/store/modules/login';
import { messageStore } from '@/store/modules/message';
import { tabBarStore } from '@/store/modules/tabbar';
import { EUserType } from '@/utils/kind';
import { debounce } from '@/utils/lodash-es';
import { clientType } from '@/utils/tools';
import { toRefs } from 'vue';
import { setAppBadgeNum } from './push-jump';

// 获取未读通知数
export const getUnreadNum = debounce(async function () {
  const mStore = messageStore();
  const store = loginStore();
  const params: IUnreadNumParamsFilter = {
    userId: store.userInfo?.userId || '',
    userType: EUserType.teacher === store.currentUserType ? 1 : 2,
    clientType,
    ...getFilterCode(),
  };

  if (!store.authInfo?.accessToken || !store.userInfo?.userId) {
    setAppBadgeNum(0);
    return;
  }

  const res = await getUnreadNumByUserFilter(params);
  mStore.unreadNum = res;
  setAppBadgeNum(mStore.unreadNum);

  const pages = getCurrentPages();
  // 包含tabbar的页面才需要展示/隐藏红点
  if (
    pages.length > 1 ||
    ![
      'pages/workbench/index',
      'pages/contacts/index',
      'pages/mine/index',
      'pages/message/index',
    ].includes(pages[0].route || '')
  )
    return;

  //自定义tabbar
  const { currentTabBar } = toRefs(tabBarStore());
  const item = currentTabBar.value.find(tmp => tmp.text === '消息');
  if (item) item.count = Number(mStore.unreadNum);

  // 接口返回字符串格式
  if (!Number(mStore.unreadNum)) {
    uni.hideTabBarRedDot({ index: 1 });
    return;
  }
  uni.showTabBarRedDot({ index: 1 });
  uni.setTabBarBadge({
    index: 1,
    text: `${mStore.unreadNum}`,
  });
}, 600);
