import { fetchCaptureRecords, ICaptureRecord } from '@/app-school-safe/services/monitoring';
import dayjs from 'dayjs';
import { onMounted, computed, Ref, ref, watch } from 'vue';

type TQueryParam = {
  deviceId: Ref<string>; // 设备uuid
  dateType: Ref<number>; // 抓拍记录时间类型 0：今日 1：近一周 2：近一个月
  loadMore: Ref<boolean>; // 加载更多
  loadComplete?: () => void; // 加载完成
};

export default ({ deviceId, dateType, loadMore, loadComplete }: TQueryParam) => {
  const offset = ref<number>(0);
  const times = computed(() => {
    let intervalDays = 0;
    if (dateType.value === 1) intervalDays = 7;
    else if (dateType.value === 2) intervalDays = 30;
    return {
      start: dayjs().subtract(intervalDays, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      end: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    };
  });

  const faceSearchResps = ref<ICaptureRecord[]>([]);
  const getCaptureRecords = async () => {
    const res = await fetchCaptureRecords({
      deviceId: deviceId.value,
      startTime: times.value.start,
      endTime: times.value.end,
      offset: offset.value,
      pageSize: 15,
    });
    faceSearchResps.value = [...faceSearchResps.value, ...res.faceSearchResps];
    offset.value = res.offset;
    loadComplete && loadComplete();
  };

  watch([dateType, deviceId], () => {
    offset.value = 0;
    faceSearchResps.value = [];
    getCaptureRecords();
  });

  watch(loadMore, getCaptureRecords);

  onMounted(() => {
    if (!deviceId.value) return;
    getCaptureRecords();
  });

  return {
    faceSearchResps,
  };
};
