import { loginStore } from '@/store/modules/login';

const getTitle = () => {
  const { userInfo } = loginStore();
  // 湾玺 locationId '2882'   艺霞组织开发 1380350166118695818
  const title = userInfo?.locationId === '2882' ? '随手拍' : '时光集';
  return title;
};

export { getTitle };
