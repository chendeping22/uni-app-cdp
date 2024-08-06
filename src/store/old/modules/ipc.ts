import { StoreOptions } from 'vuex';
import { MONITORING_COMMITS } from '../types';

type TreeNodeType = {
  id: string;
  name: string;
  type: string;
  ipcCount: number;
  alarmCount: number;
  children?: TreeNodeType[];
  status?: number;
};
export interface IPCState {
  ipc: TreeNodeType[];
}

type IMutations = {
  [k in MONITORING_COMMITS]: (state: IPCState, payload: any) => void;
};

const initialState: IPCState = {
  ipc: [],
};

const mutations: IMutations = {
  [MONITORING_COMMITS.setIPC](state, payload: TreeNodeType[]) {
    state.ipc = payload;
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<IPCState>;
