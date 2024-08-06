import { SAFETY_EDUCATION } from '@/store/old/types';
import { StoreOptions } from 'vuex';

export interface SafetyEducationState {
  gradeId: string;
  clazzId: string;
}

type Mutations = {
  [k in SAFETY_EDUCATION]: (state: SafetyEducationState, payload: any) => void;
};

const initialState: SafetyEducationState = {
  gradeId: '',
  clazzId: '',
};

const mutations: Mutations = {
  [SAFETY_EDUCATION.setClazzInfo](state: SafetyEducationState, payload: SafetyEducationState) {
    state.gradeId = payload.gradeId;
    state.clazzId = payload.clazzId;
  },
  [SAFETY_EDUCATION.clearClazzInfo](state: SafetyEducationState) {
    state.gradeId = '';
    state.clazzId = '';
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<SafetyEducationState>;
