<template>
  <alarm-detail :loading="loading" :data="accessAlarmDetail" @process-handle="processHandle">
    <preview-image :src="accessAlarmDetail?.snapImgUrl" class-name="alarm-detail-epidemic-image" />
    <device-info :detail="accessAlarmDetail" :alarm-type="AlarmTypeEnum.ACCESS" />
    <user-info :detail="accessAlarmDetail" />
    <result-info
      v-if="accessAlarmDetail?.status"
      :handle-way="accessAlarmDetail.handleWay"
      :handle-description="accessAlarmDetail.handleDescription"
      :handle-by-name="accessAlarmDetail.handleByName"
      :handle-time="accessAlarmDetail.handleTime"
      :disturb-desc="accessAlarmDetail.disturbDesc"
      :command="accessAlarmDetail.command"
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
import UserInfo from './components/user-info/index.vue';

import {
  IAccessAlarmDetail,
  getAccessRecordsAlarmDetail,
} from '@/app-school-safe/services/access-management';

import PreviewImage from '@/app-school-safe/components/preview-image/index.vue';
import { isString } from '@/utils/lodash-es';

type paramsType = {
  bizDataJson: {
    alarmTypeCode: string;
    alarmRecordId: string;
  };
};

const params = ref<paramsType>({} as paramsType);
const accessAlarmDetail = ref<IAccessAlarmDetail>();
const loading = ref<boolean>(true);

const fetchDetail = async () => {
  loading.value = true;
  try {
    const res = await getAccessRecordsAlarmDetail(params.value?.bizDataJson?.alarmRecordId);
    accessAlarmDetail.value = {
      ...res,
      name: '通行异常',
      content: `在${res?.spaceName || '未知'}空间出现${res?.name}，请注意!`,
      level: res?.levelCode,
      time: res?.snapTime,
      handleWay: res?.handleContent,
    };
  } finally {
    loading.value = false;
  }
};

// 显示处理方式
const processHandle = () => {
  const popParams = {
    recordIds: [params.value.bizDataJson?.alarmRecordId],
  };
  uni.navigateTo({
    url: `/app-school-safe/access-management/dispose?params=${JSON.stringify(popParams)}`,
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
