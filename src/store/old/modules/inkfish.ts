import { StoreOptions } from 'vuex';
import { INKFISH_COMMITS } from '../types';

interface Notification {
  appScope: number | null;
  appletScope: number | null;
  content: string | null;
  dismissed: boolean;
  id: string | null;
  status: number | null;
  syncedAt: number;
  webScope: number | null;
}

interface IInkFishState {
  hasNotification: boolean;
  notification: Notification | null;
}

type IMutations = {
  [key in INKFISH_COMMITS]: (state: IInkFishState, payload: any) => void;
};

const mutations: IMutations = {
  [INKFISH_COMMITS.dismissNotification](state: IInkFishState) {
    const notice = state.notification;
    if (notice !== null) {
      const { appScope, appletScope, content, id, status, syncedAt, webScope } = notice;
      state.notification = {
        appScope,
        appletScope,
        content,
        dismissed: true,
        id,
        status,
        syncedAt,
        webScope,
      };
    }
    state.hasNotification = false;
  },
  [INKFISH_COMMITS.setNotification](state: IInkFishState, payload: Notification) {
    state.notification = payload;

    //#ifdef APP-PLUS
    state.hasNotification = payload.status !== 0 && payload.appScope === 1;
    //#endif

    //#ifdef MP-WEIXIN
    state.hasNotification = payload.status !== 0 && payload.appletScope === 1;
    //#endif
  },
};

const initialState: IInkFishState = {
  hasNotification: false,
  notification: null,
};

const storeOption: StoreOptions<IInkFishState> = {
  state: () => initialState,
  mutations,
};

export default storeOption;

export type { IInkFishState };
