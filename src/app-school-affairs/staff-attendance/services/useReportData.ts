import { Ref, ref, watch } from 'vue';
import { TReportData, fetchReportData } from './employeeAttendance';

import dayjs from 'dayjs';

type TQueryParam = {
  dataCycle: Ref<string>; // 统计周期 日：Day，周：Week，月：Month
  dataDate: Ref<number>; // 统计日期
  refresh: Ref<boolean>; // 是否重新加载数据
};

export default ({ dataCycle, dataDate, refresh = ref(true) }: TQueryParam) => {
  const reportData = ref<TReportData>({});
  const loading = ref(false);

  const getReportData = () => {
    if (!dataCycle.value || !dataDate.value || !refresh.value || loading.value) return;

    refresh.value = false;
    loading.value = true;

    try {
      fetchReportData({
        dataCycle: dataCycle.value,
        dataDate: dayjs(dataDate.value).startOf('d').valueOf(),
      }).then((res: TReportData) => {
        reportData.value = res;
      });
    } finally {
      loading.value = false;
      refresh.value = false;
    }
  };

  watch([dataDate, refresh], () => {
    getReportData();
  });
  return reportData;
};
