// import { TeachersUpdateInfo } from '@/services/user';
// import { StoreOptions } from 'vuex';
// import { DATA_COMMITS } from '../types';

// export interface IDataState {
//   teachingInfo: TeachersUpdateInfo;
//   pushParams: any;
//   unreadNum: number;
//   pushAlarmMsgList: [];
//   qrCodeResult: any;
//   frequentList: [];
//   schemaJumpParams: string;
// }

// type IMutations = {
//   [k in DATA_COMMITS]: (state: IDataState, payload: any) => void;
// };

// const initialState: IDataState = {
//   teachingInfo: { appletSubjectReqs: [], gender: NaN, imageReqs: [], name: '', id: '' },
//   pushParams: {},
//   unreadNum: 0,
//   pushAlarmMsgList: [],
//   qrCodeResult: {},
//   frequentList: [],
//   schemaJumpParams: '',
// };

// const mutations: IMutations = {
//   [DATA_COMMITS.setTeachingInfo](state, payload: TeachersUpdateInfo) {
//     state.teachingInfo = payload;
//   },
//   [DATA_COMMITS.setPushParams](state, payload: any) {
//     state.pushParams = payload;
//   },
//   [DATA_COMMITS.setUnreadNum](state, payload: number) {
//     state.unreadNum = payload;
//   },
//   [DATA_COMMITS.setPushAlarmMsgList](state, payload: []) {
//     state.pushAlarmMsgList = payload;
//   },
//   [DATA_COMMITS.setQrCodeResult](state, payload: any) {
//     state.qrCodeResult = payload;
//   },
//   [DATA_COMMITS.setFrequentList](state, payload: any) {
//     state.frequentList = payload;
//   },
//   [DATA_COMMITS.setSchemaJumpParams](state, payload: any) {
//     state.schemaJumpParams = payload;
//   },
// };

// export default {
//   state: () => initialState,
//   mutations,
// } as StoreOptions<IDataState>;
