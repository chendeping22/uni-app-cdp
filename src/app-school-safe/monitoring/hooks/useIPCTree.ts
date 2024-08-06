import { fetchIpcList } from '@/services/monitoring';
import { onMounted, reactive } from 'vue';

type TreeNodeType = {
  id: string;
  name: string;
  type: string;
  ipcCount: number;
  alarmCount: number;
  children?: any[];
  status?: number;
};
export default () => {
  const IPCTreeResps = reactive<TreeNodeType[]>([]);
  const getIPCTree = async () => {
    const res = await fetchIpcList();

    IPCTreeResps.push(...res);
  };
  onMounted(getIPCTree);
  return {
    IPCTreeResps,
  };
};
