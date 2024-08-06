import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface InviteParams {
  inviteType: string;
  locationId: string;
  params: string;
  title: string;
  id: string;
}

/**
 * inviteStore
 * 邀请跳转缓存
 */
export const inviteStore = defineStore('inviteStore', () => {
  // 缓存信息
  const inviteParams = ref({} as InviteParams);

  // 提交
  const setInviteParams = (value: InviteParams) => {
    inviteParams.value = value;
  };

  return {
    inviteParams,
    setInviteParams,
  };
});
