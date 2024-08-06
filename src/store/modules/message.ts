import { defineStore } from 'pinia';
import { ref } from 'vue';
/**
 * message
 * 消息缓存
 */
export const messageStore = defineStore('messageStore', () => {
  // 未读消息数
  const unreadNum = ref(0);
  const pendingMsgRead = ref(0);

  const setPendingMsgRead = (pendingReadMsgId: number) => {
    pendingMsgRead.value = pendingReadMsgId;
  };

  const getPendingMsgRead = () => {
    return pendingMsgRead.value;
  };

  return {
    unreadNum,
    setPendingMsgRead,
    getPendingMsgRead,
  };
});
