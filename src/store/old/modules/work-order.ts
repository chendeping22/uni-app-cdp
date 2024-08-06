import { StoreOptions } from 'vuex';
import { WORK_ORDER_COMMITS } from '../types';

export interface IWorkOrderState {
  userList: any[];
}

type IMutations = {
  [k in WORK_ORDER_COMMITS]: (state: IWorkOrderState, payload: any) => void;
};

const initialState: IWorkOrderState = {
  userList: [],
};

const mutations: IMutations = {
  [WORK_ORDER_COMMITS.setUserList](state, payload: any[]) {
    state.userList = payload;
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<IWorkOrderState>;
