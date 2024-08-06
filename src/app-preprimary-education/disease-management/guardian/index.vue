<template>
  <mt-page title="疾病管理" :show-top-gap="false">
    <c-refresh-scroll
      ref="refreshScrollRef"
      :fetch-data-func="fetchData"
      :auto-mount="true"
      :show-no-more-tip="true"
    >
      <template #top_area>
        <view class="flex ptb-xs bg-white h-88">
          <view style="width: 40%" class="flex flex-center" @click="filterSelectShow = true">
            <view class="mr-xxs font-content color-secondary">{{ filterText }}</view>
            <c-icon name="icon_arrow_down" :size="15"> </c-icon>
          </view>
          <view style="width: 60%" class="flex flex-center" @click="calendarShow = true">
            <view class="mr-xxs font-content color-secondary">{{
              `${calendarRangeValue[0]}~${calendarRangeValue[1]}`
            }}</view>
            <c-icon name="icon_arrow_down" :size="15"></c-icon>
          </view>
        </view>

        <c-calendar
          v-model:open="calendarShow"
          v-model="calendarRangeValue"
          mode="range"
          z-index="10000000"
          :max-date="dayjs().format('YYYY-MM-DD')"
          @change="handleSwitchDate"
        />
      </template>
      <RecordList
        :tags="RecordGuardianTags"
        :data="recordListData"
        @selectItem="handleJumpDetail"
      />
    </c-refresh-scroll>
    <c-select
      v-model:show="filterSelectShow"
      v-model:list="fliterOption"
      :auto-close-after-select="false"
      :show-check-icon="true"
      title="请选择"
      title-type="text"
      @onConfirm="handleSelectFilter"
    />
  </mt-page>
</template>

<script lang="ts" setup>
import { Disease_Management, useStore } from '@/store/old';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, nextTick, ref } from 'vue';
import { IDataLoadType, IPager } from '../../components/imp-refresh-scroll/imp-refresh-scroll.vue';
import mtPage from '../../components/mt-page/mt-page.vue';
import {
  IFetchStudentDiseaseRecordsParam,
  fetchStudentDiseaseRecords,
} from '../../services/disease-management';
import { TStudentInfo, fetchChildren } from '../../services/feedMedicine';
import { RecordGuardianTags } from '../common/constant';
import RecordList from '../components/record-list/index.vue';
import { RecordItem } from '../types/record';

const store = useStore();

const recordListData = ref<RecordItem[]>([]);

const refreshScrollRef = ref();
/* 状态筛选 */
const filterSelectShow = ref(false);

const fliterOption = ref([
  {
    text: '未康复',
    checked: false,
  },
  {
    text: '已康复',
    checked: false,
  },

  {
    text: '已作废',
    checked: false,
  },
]);

const filterValue = ref<number | undefined>();

const filterText = computed(() => {
  if (filterValue.value === undefined) return '状态';
  return fliterOption.value[filterValue.value].text;
});

/* 时间范围 */
const calendarShow = ref(false);

const calendarRangeValue = ref([
  dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD'),
]);

const getChildrens = async function () {
  let childrens: TStudentInfo[] = [];
  try {
    const res = await fetchChildren();
    if (Array.isArray(res) && res?.length > 0) {
      childrens = res;
    } else {
      childrens = [];
    }
  } catch (error) {
    childrens = [];
  }
  return childrens;
};

const fetchData = async (pager: IPager, type: IDataLoadType) => {
  const { pageSize, pageNum } = pager;
  const childrens = await getChildrens();
  // c-calendar回传的日期格式，如果使用new Date转换，在IOS端会出现NaN的问题
  const sickenStartDate = String(dayjs(calendarRangeValue.value[0] + ' 00:00:00').valueOf()),
    sickenEndDate = String(dayjs(calendarRangeValue.value[1] + ' 23:59:59').valueOf());
  const params: IFetchStudentDiseaseRecordsParam = {
    studentIds: childrens?.length ? childrens.map(item => item.id) : [],
    sickenStartDate,
    sickenEndDate,
    pageNum: pageNum,
    pageSize: pageSize,
  };
  if (filterValue.value || filterValue.value === 0) params['status'] = filterValue.value;
  const res = await fetchStudentDiseaseRecords(params);

  type === 'new' && (recordListData.value = []);
  recordListData.value.push(...res.result);
  return res;
};

const handleSwitchDate = () => {
  nextTick(() => {
    refreshScrollRef.value?.initData();
  });
};

const handleSelectFilter = (idxs: number[]) => {
  let res: undefined | number = undefined;
  //清空
  if (!idxs?.length) {
    res = undefined;
  } else {
    const [index] = idxs;
    switch (fliterOption.value[index].text) {
      case '未康复': {
        res = 0;
        break;
      }
      case '已康复': {
        res = 1;
        break;
      }
      case '已作废': {
        res = 2;
        break;
      }
    }
  }
  filterValue.value = res;

  nextTick(() => {
    refreshScrollRef.value?.initData();
  });
};

const handleJumpDetail = (item: RecordItem) => {
  uni.navigateTo({
    url: `/app-preprimary-education/disease-management/guardian/detail?id=${item.id}`,
  });
};

onLoad(() => {
  store.commit(Disease_Management.clearSymptomInfo);
});
</script>

<style lang="sass" scoped></style>
