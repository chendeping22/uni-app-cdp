import { IDiseaseManagementState } from '@/store/old/modules/disease-management';
// import { SafetyEducationState } from '@/store/modules/safety-education';
// import { SportsClockinIndicatrixState } from '@/store/modules/sports-clockin';
import { InjectionKey } from 'vue';
import { Store, useStore as baseUseStore, createStore } from 'vuex';
import clockIn, { IClockInState } from './modules/clock-in';
import dailyHealth, { IDailyHealthState } from './modules/daily-health';
import visionCollect from './modules/vision-collect';
import visionHealth from './modules/vision-health';
// import { IDataState } from './modules/data';
// import { IEnv } from './modules/env';
import inkfish, { IInkFishState } from './modules/inkfish';
// import { IPCState } from './modules/ipc';
// import { IPageState } from './modules/page';
// import { ISystemState } from './modules/system';
// import { IWorkOrderState } from './modules/work-order';
import diseaseManagement from './modules/disease-management';

export {
  CLOCK_IN_COMMITS,
  DAILY_HEALTH,
  DATA_COMMITS,
  Disease_Management,
  ENV_COMMITS,
  INKFISH_COMMITS,
  MONITORING_COMMITS,
  PAGE_COMMITS,
  SAFETY_EDUCATION,
  SPORTS_CLOCKIN,
  SYSTEM_COMMITS,
} from './types';

export interface IStoreState {
  [x: string]: any;
  // env: IEnv;
  // system: ISystemState;
  // data: IDataState;
  clockIn: IClockInState;
  // workOrder: IWorkOrderState;
  // ipc: IPCState;
  // page: IPageState;
  inkfish: IInkFishState;
  dailyHealth: IDailyHealthState;
  visionHealth: any;
  visionCollect: any;
  // safetyEducation: SafetyEducationState;
  // sportsClockin: SportsClockinIndicatrixState;
  diseaseManagement: IDiseaseManagementState;
}

// 定义 injection key
export const IStoreKey: InjectionKey<Store<IStoreState>> = Symbol();

export default createStore<any>({
  modules: {
    // env,
    // system,
    // data,
    clockIn,
    // workOrder,
    // ipc,
    // page,
    inkfish,
    dailyHealth,
    visionHealth,
    visionCollect,
    // safetyEducation,
    // sportsClockin,
    diseaseManagement,
  },
});

export function useStore() {
  return baseUseStore(IStoreKey);
}
