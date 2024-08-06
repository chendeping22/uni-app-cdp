import { defineStore } from 'pinia';
import { ref } from 'vue';

const useSaveUploadData = () => {
  /**压缩的 */
  const fileData = ref<any[]>([]);
  /**原始的 */
  const originFileData = ref<any[]>([]);
  /**压缩的 */
  const setFileData = (obj: any) => {
    fileData.value = obj;
  };
  /**原始的 */
  const setOriginFileData = (obj: any) => {
    originFileData.value = obj;
  };
  const delFileData = (obj: any) => {
    fileData.value = fileData.value.filter(item => item.fileId !== obj.fileId);
    originFileData.value = originFileData.value.filter(item => item.fileId !== obj.fileId);
  };
  const clear = () => {
    fileData.value = [];
    originFileData.value = [];
  };
  return {
    fileData,
    originFileData,
    setFileData,
    setOriginFileData,
    delFileData,
    clear,
  };
};

export const useClockIn = defineStore('clockIn', () => {
  const sourceUploadData = useSaveUploadData();

  return { sourceUploadData };
});
