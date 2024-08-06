<template>
  <c-refresh-scroll
    ref="refreshScrollRef"
    :show-success-tip="false"
    :page-size="20"
    :fetch-data-func="fetchDataFunc"
  >
    <template #top_area>
      <u-dropdown class="bg-white">
        <u-dropdown-item
          v-model="monitorType"
          :title="monitorTypeStr"
          :options="
            AlarmMonitorEnum.filter(item => item.value !== AlarmMonitorCode.NORMALIZED_RECORDING)
          "
        />
        <u-dropdown-item
          v-model="alarmTimeType"
          :title="alarmTimeTypeStr"
          :options="AlarmTimeEnum"
        />
      </u-dropdown>
    </template>
    <template v-if="records?.length">
      <view class="plr-l pt-l">{{ total }}条告警</view>
      <u-card
        v-for="item in records"
        :key="item.id"
        :show-head="false"
        @click="detailHandle(item.id)"
      >
        <template #body>
          <view class="flex flex-between">
            <view class="flex flex-grow ellipsis">
              <u-icon name="map" class="color-primary" size="48" />
              <view class="flex-grow font-title color-base">{{ item.spaceFullName }}</view>
            </view>
            <alarm-badge class="no-shrink" :code="item.levelCode" :name="item.levelName" />
          </view>
          <view class="color-base font-content mtb-b">{{ item.conditionJson }}</view>
          <view class="color-placeholder font-secondary">{{
            dayjs(item.snapTime).format('YYYY-MM-DD HH:mm:ss')
          }}</view>
        </template>
      </u-card>
      <c-empty-line need-safe-bottom class-name="ptb-xl" />
    </template>
    <view v-else style="padding-top: 320rpx">
      <u-empty-custom content="暂无数据" mode="list" />
    </view>
  </c-refresh-scroll>
</template>
<script lang="ts" setup>
import AlarmBadge from '@/app-school-safe/components/alarm-badge/index.vue';
import { IAlarmDataItem, fetchRecordList } from '@/app-school-safe/services/ai-prevent-bullying';
import dayjs from 'dayjs';
import { computed, ref, watch } from 'vue';
import { AlarmMonitorCode, AlarmMonitorEnum } from '../../constants/AlarmMonitorEnum';
import { AlarmTimeCode, AlarmTimeEnum } from '../../constants/AlarmTimeEnum';
const monitorType = ref(AlarmMonitorCode.ALL);
const alarmTimeType = ref(AlarmTimeCode.TODAY);
const refreshScrollRef = ref<any>();
const records = ref<IAlarmDataItem[]>([]);
const total = ref(0);

const monitorTypeStr = computed(() => {
  return AlarmMonitorEnum.find(item => item.value === monitorType.value)?.label;
});

const alarmTimeTypeStr = computed(() => {
  return AlarmTimeEnum.find(item => item.value === alarmTimeType.value)?.label;
});

const fetchDataFunc = async (pager: any, loadType: any) => {
  const { pageSize, pageNum } = pager;
  const alarmTimeScope = AlarmTimeEnum.find(
    item => item.value === alarmTimeType.value,
  )?.getTimeScope();
  const res = await fetchRecordList({
    pageSize,
    pageNum,
    monitorType: monitorType.value === AlarmMonitorCode.ALL ? undefined : monitorType.value,
    alarmTimeStart: alarmTimeScope?.alarmTimeStart,
    alarmTimeEnd: alarmTimeScope?.alarmTimeEnd,
  });
  loadType === 'new' && (records.value = []);
  records.value.push(...res.result);
  total.value = res.total;
  return res;
};

const detailHandle = (id: string) => {
  uni.navigateTo({
    url: `/app-school-safe/ai-prevent-bullying/alarm-detail?id=${id}`,
  });
};

watch([monitorType, alarmTimeType], () => {
  refreshScrollRef.value?.initPager();
  refreshScrollRef.value?.fetchData('new');
});
</script>

<style scoped lang="scss"></style>
