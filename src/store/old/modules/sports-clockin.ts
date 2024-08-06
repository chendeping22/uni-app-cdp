import { SPORTS_CLOCKIN } from '@/store/types';
import { StoreOptions } from 'vuex';

interface BluetoothConnectedRecord {
  name: string;
  deviceId: string;
}

interface SportsClockinResult {
  studentId: number;
  taskId: number;
  taskContentId: string;
  clockinTime: string;
  indicatrixCode: string;
  duration: number;
  qty: number;
  unit: string;
  clockinDate: string;
}

export interface SportsClockinIndicatrixState {
  bluetoothConnectedRecord: BluetoothConnectedRecord;
  sportsResult: SportsClockinResult[];
}

type Mutations = {
  [k in SPORTS_CLOCKIN]: (state: SportsClockinIndicatrixState, payload: any) => void;
};

const initialState: SportsClockinIndicatrixState = {
  bluetoothConnectedRecord: {
    name: '',
    deviceId: '',
  },
  sportsResult: [],
};

const findTargetSportsItem = (
  state: SportsClockinIndicatrixState,
  payload: SportsClockinResult,
): number =>
  state.sportsResult.findIndex(
    r =>
      r.taskId === payload.taskId &&
      r.indicatrixCode == payload.indicatrixCode &&
      r.clockinDate == payload.clockinDate &&
      r.studentId === payload.studentId,
  );

const mutations: Mutations = {
  [SPORTS_CLOCKIN.saveBluetoothDeviceInfo](state, payload: BluetoothConnectedRecord) {
    state.bluetoothConnectedRecord.name = payload.name;
    state.bluetoothConnectedRecord.deviceId = payload.deviceId;
  },
  [SPORTS_CLOCKIN.clearBluetoothDeviceInfo](state) {
    state.bluetoothConnectedRecord.name = '';
    state.bluetoothConnectedRecord.deviceId = '';
  },
  [SPORTS_CLOCKIN.saveSportsResult](state, payload: SportsClockinResult) {
    const index = findTargetSportsItem(state, payload);

    if (index === -1) {
      state.sportsResult.push(payload);
    } else {
      state.sportsResult.splice(index, 1, payload);
    }
  },
  [SPORTS_CLOCKIN.removeSportsResult](state, payload: SportsClockinResult) {
    const index = findTargetSportsItem(state, payload);

    if (index !== -1) {
      state.sportsResult.splice(index, 1);
    }
  },
};

export default {
  state: () => initialState,
  mutations,
} as StoreOptions<SportsClockinIndicatrixState>;
