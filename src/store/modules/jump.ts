import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * jumpStore
 * 消息详情跳转缓存
 */
export const jumpStore = defineStore('jumpStore', () => {
  // 缓存信息
  const pushParams = ref();
  // schema
  const schemaParams = ref();

  // 提交
  const setPushParams = (value: any) => {
    pushParams.value = value;
  };

  // schema
  const setSchemaParams = (value: any) => {
    schemaParams.value = value;
  };

  return {
    pushParams,
    setPushParams,
    schemaParams,
    setSchemaParams,
  };
});
