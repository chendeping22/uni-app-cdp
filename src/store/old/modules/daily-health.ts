// import { IgetStudentList } from '@/services/health-day';
import { StoreOptions } from 'vuex';
import { DAILY_HEALTH } from '../types';

export interface IgetStudentList {
  age: number;
  birthday: string;
  certificateNumber: string;
  certificateType: number;
  clazzId: string;
  clazzName: string;
  clazzNo: number;
  currentLevel: number;
  enrollmentYear: number;
  firstLetter: string; // 名称首字母
  gender: number;
  gradeId: number;
  gradeName: string;
  healthStatus: number; // 1正常 2异常
  id: string;
  locationId: number;
  name: string;
  studentCode: string;
  sectionType: number;
  photoUrl: string;
}

export interface IDailyHealthState {
  students: IgetStudentList[];
}

type IMutations = {
  [k in DAILY_HEALTH]: (state: IDailyHealthState, payload: any) => void;
};

const initialState: IDailyHealthState = {
  students: [],
};

const mutations: IMutations = {
  [DAILY_HEALTH.setdailyHealthStudents](state, payload: any) {
    state.students = payload;
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<IDailyHealthState>;
