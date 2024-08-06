import { StoreOptions } from 'vuex';
import { PAGE_COMMITS } from '../types';

export type IPageLoadingStatus = 0 | 1 | 2; // 1-成功(展示slot), 0-加载中(展示加载动画), 2-失败(展示加载失败页)。 默认1, 即不处理

export interface IPageState {
  pageLoadingStatus: IPageLoadingStatus;
}

type IMutations = {
  [k in PAGE_COMMITS]: (state: IPageState, payload: any) => void;
};

const initialState: IPageState = {
  pageLoadingStatus: 0,
};

const mutations: IMutations = {
  [PAGE_COMMITS.setPageLoadingStatus](state, payload: IPageLoadingStatus) {
    state.pageLoadingStatus = payload;
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<IPageState>;
