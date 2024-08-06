import type { SymptomItem } from '@/app-preprimary-education/disease-management/types/record';
import { StoreOptions } from 'vuex';
import { Disease_Management } from '../types';

export interface IDiseaseManagementState {
  symptomList: SymptomItem[];
}

type Mutations = {
  [k in Disease_Management]: (state: IDiseaseManagementState, payload: any) => void;
};

const initialState: IDiseaseManagementState = {
  symptomList: [],
};

const mutations: Mutations = {
  [Disease_Management.saveSymptomInfo](state, payload: SymptomItem[]) {
    state.symptomList = payload;
  },
  [Disease_Management.clearSymptomInfo](state) {
    state.symptomList = [];
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<IDiseaseManagementState>;
