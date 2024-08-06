import { StoreOptions } from 'vuex';
import { SYSTEM_COMMITS } from '../types';

interface ImenuButtonBoundingClientRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}
export interface IMiniProgram {
  title: string;
  params: string;
}
export interface ISystemState {
  navBarHeight: number;
  tabBarHeight: number;
  menuButtonBoundingClientRect: ImenuButtonBoundingClientRect;
  systemInfo: UniApp.GetSystemInfoResult;
  miniProgram: IMiniProgram;
  followGuideOpened: boolean;
}

type IMutations = {
  [k in SYSTEM_COMMITS]: (state: ISystemState, payload: any) => void;
};

const menuButtonBoundingClientRect = uni?.getMenuButtonBoundingClientRect?.();

const systemInfo = uni.getSystemInfoSync();

const initialState: ISystemState = {
  tabBarHeight: 80,
  navBarHeight: 0,
  menuButtonBoundingClientRect,
  systemInfo,
  miniProgram: {} as IMiniProgram,
  /** 关注页是否已浏览过*/
  followGuideOpened: false,
};

const mutations: IMutations = {
  [SYSTEM_COMMITS.setNavBarHeight](state, payload: number) {
    state.navBarHeight = payload;
  },
  [SYSTEM_COMMITS.setTabBarHeight](state, payload: number) {
    state.tabBarHeight = payload;
  },
  [SYSTEM_COMMITS.setMiniProgram](state, payload: IMiniProgram) {
    state.miniProgram = payload;
  },
  [SYSTEM_COMMITS.setFollowGuideOpened](state, payLoad: boolean) {
    state.followGuideOpened = payLoad;
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<ISystemState>;
