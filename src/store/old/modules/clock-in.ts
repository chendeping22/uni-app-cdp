import { StoreOptions } from 'vuex';
import { CLOCK_IN_COMMITS } from '../types';

export interface IClockInState {
  formData: any;
  selectedClass: any;
}

type IMutations = {
  [k in CLOCK_IN_COMMITS]: (state: IClockInState, payload: any) => void;
};

const initialState: IClockInState = {
  formData: {},
  selectedClass: {},
};

const mutations: IMutations = {
  [CLOCK_IN_COMMITS.setFormData](state, payload: any) {
    state.formData = payload;
  },
  [CLOCK_IN_COMMITS.setSelectedClass](state, payload: any) {
    state.selectedClass = payload;
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<IClockInState>;
