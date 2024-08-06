<template>
  <alarm-detail :loading="loading" :data="fireSafetyData" @process-handle="processHandle">
    <video-info :video-url="fireSafetyData?.videoUrl" />
    <device-info :detail="fireSafetyData" :alarm-type="AlarmTypeEnum.FIRE" />
    <result-info
      v-if="fireSafetyData?.status"
      :handle-way="fireSafetyData.handleWay"
      :handle-description="fireSafetyData.handleDescription"
      :handle-by-name="fireSafetyData.handleByName"
      :handle-time="fireSafetyData.handleTime"
      :disturb-desc="fireSafetyData.disturbDesc"
      :command="fireSafetyData.command"
    />
  </alarm-detail>
</template>
<script lang="ts" setup>
import AlarmDetail from '@/app-school-safe/components/alarm-detail/index.vue';
import DeviceInfo from '@/app-school-safe/components/alarm-device-info/index.vue';
import ResultInfo from '@/app-school-safe/components/alarm-result-info/index.vue';
import { AlarmTypeEnum } from '@/app-school-safe/constants/AlarmTypeEnum';
import { getPageParams } from '@/utils/tools';
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import VideoInfo from './components/video-info/index.vue';

import { getAlarmDetail, type FireSafetyAlarmItem } from '@/app-school-safe/services/fire-safety';
import { isString } from '@/utils/lodash-es';

type paramsType = {
  bizDataJson: {
    alarmTypeCode: string;
    alarmRecordId: string;
  };
};

const alarmType = ref('');
const params = ref<paramsType>({} as paramsType);
const fireSafetyData = ref<FireSafetyAlarmItem>();
const loading = ref<boolean>(true);

const fetchDetail = async () => {
  loading.value = true;
  try {
    const res = await getAlarmDetail(params.value?.bizDataJson?.alarmRecordId);
    fireSafetyData.value = {
      ...res,
      name: res?.configName,
      content: `在${res?.spaceName || '未知'}空间出现${res?.configName}，请注意!`,
      level: res?.levelCode,
      time: res?.createTime,
      status: res?.handleStatus,
      handleWay: res?.handleResultName,
      command: res?.extMap?.command,
    };
  } finally {
    loading.value = false;
  }
};

// 显示处理方式
const processHandle = () => {
  const popParams = {
    alarmType: alarmType.value,
    recordIds: [params.value.bizDataJson?.alarmRecordId],
    deviceModel: fireSafetyData.value?.deviceModel,
  };
  uni.navigateTo({
    url: `/app-school-safe/fire-safety/dispose?params=${JSON.stringify(popParams)}`,
  });
};

onMounted(() => {
  fetchDetail();
});

onBeforeMount(() => {
  const pageParams = getPageParams();
  const formatData = JSON.parse(pageParams.detail);
  params.value = {
    ...formatData,
    bizDataJson: isString(formatData.bizDataJson)
      ? JSON.parse(formatData.bizDataJson)
      : formatData.bizDataJson,
  };

  uni.$on('alarmDisposeCallBack', fetchDetail);
});

onBeforeUnmount(() => {
  uni.$off('alarmDisposeCallBack', fetchDetail);
});
</script>
<style lang="scss" scoped />
