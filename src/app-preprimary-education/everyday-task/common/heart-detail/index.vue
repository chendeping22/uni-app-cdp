<template>
  <mt-page title="心率" theme="default">
    <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
      <view class="font-xt color-base mb-b bold"> 心率数据 </view>
      <view class="flex-around pb-xs">
        <view class="text-center w33p lineR">
          <view class="color-secondary font-content"> 最大心率 </view>
          <view class="flex-center">
            <view class="font-xxt color-base mr-xxs bold"> {{ allData?.maxHeart || '0' }} </view>
            <view class="color-secondary font-secondary"> 次/分 </view>
          </view>
        </view>
        <view class="text-center w33p lineR">
          <view class="color-secondary font-content"> 最小心率 </view>
          <view class="flex-center">
            <view class="font-xxt color-base mr-xxs bold"> {{ allData?.minHeart || '0' }} </view>
            <view class="color-secondary font-secondary"> 次/分 </view>
          </view>
        </view>
        <view class="text-center w33p">
          <view class="color-secondary font-content"> 平均心率 </view>
          <view class="flex-center">
            <view class="font-xxt color-base mr-xxs bold"> {{ allData?.avgHeart || '0' }} </view>
            <view class="color-secondary font-secondary"> 次/分 </view>
          </view>
        </view>
      </view>
    </c-card>
    <c-card class-name="mlr-l mtb-b" padding-type="b" radius-type="default">
      <view class="font-xt color-base mb-b bold"> 提醒次数 ({{ alertList?.length }})</view>
      <view v-if="alertList?.length">
        <view
          v-for="(item, index) in alertList"
          :key="index"
          class="flex-between borderB pb-b pt-b"
        >
          <view class="font-title color-base"> {{ item?.time }} </view>
          <view class="color-secondary"> {{ item?.value }} 次/分 </view>
        </view>
        <view class="pt-b font-content color-placeholder">
          {{ date2 }}心率提醒阈值：大于{{ heartValue }}bpm
        </view>
      </view>

      <c-empty v-else content="暂无数据" bg-type="transparent" />
    </c-card>
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import {
  getHisDayQuery,
  heartRate_parent,
  heartRate_teacher,
} from '@/app-preprimary-education/services/health-day';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, ref } from 'vue';
export default defineComponent({
  components: { mtPage },
  setup() {
    const isGuardian = loginStore().currentUserType !== EUserType.teacher;
    const heartValue = ref(0);
    const allData = ref(null);
    const date2 = ref('');
    const alertList = ref([]);
    const init = async (id: string, date: string) => {
      const params = {
        studentId: id,
        date: date,
      };
      if (isGuardian) {
        const res = await heartRate_parent(params);
        alertList.value = res;
      } else {
        const res = await heartRate_teacher(params);
        alertList.value = res;
      }
    };
    const getHeart = async () => {
      const { heart } = await getHisDayQuery(date2.value);
      heartValue.value = heart;
    };
    onBeforeMount(() => {
      const { id, date, data } = getPageParams();
      date2.value = date;
      allData.value = JSON.parse(data);
      init(id, date);
      getHeart();
    });
    return { allData, alertList, heartValue, date2 };
  },
});
</script>
<style scoped lang="scss">
.borderB {
  border-bottom: 1px solid #e5e6ec;
}
</style>
