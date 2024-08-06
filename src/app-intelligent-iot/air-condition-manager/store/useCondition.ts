import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TGroupRecord, TLockRecord } from '../type';

export const useCondition = defineStore('conditionStore', () => {
  const lockRecord = ref<TLockRecord>({} as TLockRecord);
  const groupRecord = ref<TGroupRecord>({} as TGroupRecord);
  const $set = (data: {
    lockRecord?: TLockRecord;
    groupRecord?: TGroupRecord;
  }) => {
    if (data.lockRecord) lockRecord.value = data.lockRecord;
    if (data.groupRecord) groupRecord.value = data.groupRecord;
  };

  return {
    lockRecord,
    groupRecord,
    $set,
  };
});
