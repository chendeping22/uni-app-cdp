<template>
  <page
    :title="pageTitle"
    custom-overflow="scroll"
    :empty="schoolCalendarData.length > 0 ? false : '暂无校历'"
  >
    <weeklyHeader
      :school-calendar-data="schoolCalendarData"
      :user-id="userInfo?.userId"
      @change="onHeaderNavChange"
    />
    <weeklySelect
      v-if="viewType"
      v-model:card-list="cardLists"
      :condition-data="conditionData"
      :set-currentday="currentDay"
      :week-no="curWeekItem.weekNo"
      @currentDay="getCurrentDay"
    />
    <!-- <weeklySelect
      v-if="viewType"
      v-model:card-list="cardLists"
      :condition-data="conditionData"
      :week-no="curWeekItem.weekNo"
      @update-week-no="updateWeekNo"
    /> -->
    <weeklyContent
      :view-type="viewType"
      :condition-data="conditionData"
      :card-lists="cardLists"
      @updateCalendar="updateCalendar"
      @editItem="getDataEvent"
    />

    <weeklyForm
      :visible="addModalVisible"
      :section-type="curFaculty"
      :modal-type="modalType"
      :section-types="curCalendar?.sectionTypes"
      :location-id="userInfo?.locationId"
      :add-calendar-date="addCalendarDate"
      :edit-weekly-item="editWeeklyItem"
      :cur-calendar-end-date="curCalendar?.endDate"
      :cur-calendar-start-date="curCalendar?.startDate"
      @closeEvent="handleCloseAddModal"
      @refresh="refreshEvent"
      @resetData="resetModalData"
    />

    <view
      v-show="
        (!pageParam.userId || (pageParam.userId && pageParam.userId === userInfo?.userId)) &&
        !addModalVisible
      "
      class="calendar-btn"
      style="top: calc(100vh - 244rpx)"
      @click="() => addEvent()"
      ><u-icon name="plus" size="40" color="#fff"></u-icon
    ></view>
    <weeklyGuide
      v-if="
        (!pageParam.userId || (pageParam.userId && pageParam.userId === userInfo?.userId)) &&
        maskShow
      "
      @finished="onGuideShowFinished"
    />
  </page>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { getPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { onBeforeMount, ref, watch } from 'vue';
import weeklyContent from '../components/weeklyContent/index.vue';
import weeklyForm from '../components/weeklyForm.vue';
import weeklyGuide from '../components/weeklyGuide/index.vue';
import weeklyHeader from '../components/weeklyHeader.vue';
import weeklySelect from '../components/weeklySelect/index.vue';
import {
  ModalParams,
  ModalTypeEnum,
  WeeklyItem,
  type ConditionRspData,
  type IWeek,
  type NavFormData,
  type WeeklyCalendarsItem,
} from '../constants/index';
import { fetchFindByConditions, fetchFindSchoolCalendar } from '../services/index';
const userInfo = loginStore().userInfo;
const schoolCalendarData = ref();
const cardLists = ref([]);
const pageTitle = ref('周行事历');
const curCalendar = ref<WeeklyCalendarsItem>(); //当前选中校历
const curWeekItem = ref<IWeek>({
  endDate: '',
  startDate: '',
  defaultFlag: 0,
  weekNo: 0,
  weekName: '',
}); //当前选中周

//日程弹窗相关
const addModalVisible = ref(false);
const modalType = ref<ModalTypeEnum>(ModalTypeEnum.ADD);
const addCalendarDate = ref<string>();
const editWeeklyItem = ref<WeeklyItem>();

const curFaculty = ref<number>(1); // 当前选中学段
const viewType = ref<boolean>(true); //视图模式  true为卡片
const queryTypeArr = ref<number[] | []>([]);
//周行事例数据
const conditionData = ref<ConditionRspData[]>([]);
// 新人引导
const maskShow = ref(false);
const guideKeyName = 'schoolAffairsGuide';
const guideTagKey = 'weeklyRoutines';
const guideTagVal = ref('');
const currentDay = ref('');

//其他用户日程参数
const pageParam = ref();

const getCurrentDay = (date: string) => {
  currentDay.value = date;
};
watch(
  () => curWeekItem.value.weekNo,
  (newval, oldVal) => {
    if (oldVal != 0) {
      currentDay.value = '';
    }
  },
);
const initData = async () => {
  const locationId =
    pageParam.value && pageParam.value.locationId ? pageParam.value.locationId : '';
  schoolCalendarData.value = await fetchFindSchoolCalendar(locationId);
  handleShowGuideBox();
  console.log('calendarData', schoolCalendarData.value);
};
// 新人引导
const handleShowGuideBox = async () => {
  guideTagVal.value = await uni.getStorageSync(guideKeyName);
  if (!guideTagVal.value) {
    maskShow.value = true;
  } else {
    const val = JSON.parse(guideTagVal.value)[guideTagKey];
    if (!val) {
      maskShow.value = true;
    }
  }
};
// const currentWeekNo = ref(0);
// const updateWeekNo = (weekNo: number) => {
//   currentWeekNo.value = weekNo;
// };
const onGuideShowFinished = async () => {
  maskShow.value = false;
  guideTagVal.value = await uni.getStorageSync(guideKeyName);
  if (!guideTagVal.value) {
    uni.setStorageSync(guideKeyName, JSON.stringify({ weeklyRoutines: '1' }));
  } else {
    const val = JSON.parse(guideTagVal.value);
    if (!val[guideTagKey]) {
      val[guideTagKey] = 1;
      uni.setStorageSync(guideKeyName, JSON.stringify(val));
    }
  }
};
const onHeaderNavChange = (data: NavFormData) => {
  curCalendar.value = data.curCalendar;
  curWeekItem.value = data.curWeekItem;
  curFaculty.value = data.curFaculty;
  viewType.value = data.viewType;
  if (data.queryType && data.queryType[0]) {
    queryTypeArr.value = data.queryType;
  } else {
    queryTypeArr.value = [];
  }

  //触发周行示例的方法
  getCalendarListData();
};

const getCalendarListData = async () => {
  uni.showLoading();
  try {
    const reqData: any = {
      endDate: curWeekItem.value.endDate,
      startDate: curWeekItem.value.startDate,
      queryTypes: queryTypeArr.value,
      sectionType: curFaculty.value,
      daysOfWeek: 7,
    };
    if (pageParam.value && pageParam.value.locationId) {
      reqData.locationId = pageParam.value.locationId;
    }
    if (pageParam.value && pageParam.value.userId) {
      reqData.userId = pageParam.value.userId;
    }
    conditionData.value = await fetchFindByConditions(reqData);
    uni.hideLoading();
    console.log('===conditionData', conditionData.value);
  } catch (error) {
    uni.hideLoading();
    // message.error('暂未获取到任何校历信息！');
  }
};

const updateCalendar = () => {
  getCalendarListData();
};
//添加日程弹窗相关逻辑
const handleShowAddModal = (type: ModalTypeEnum, data?: ModalParams) => {
  console.log('🚀 ~ handleShowAddModal ~ data:', data);
  modalType.value = type;
  addModalVisible.value = !addModalVisible.value;
  //列表&卡片模式添加日程带具体日期
  if (data && data.date && type === ModalTypeEnum.ADD) {
    addCalendarDate.value = data.date;
  }

  //编辑日程传参
  if (data && data.weeklyItem) {
    editWeeklyItem.value = data.weeklyItem;
  }
};
// 日程相关方法
const handleCloseAddModal = () => {
  addModalVisible.value = false;
};
const refreshEvent = () => {
  getCalendarListData();
};
const addEvent = () => {
  // 当前时间与校历开始时间对比，最早可设置日程时间为校历开始时间
  const nowDate = dayjs();
  const startCalendarDate = dayjs(curCalendar.value && curCalendar.value.startDate);
  const defaultDate = nowDate.isBefore(startCalendarDate) ? startCalendarDate : nowDate;
  handleShowAddModal(ModalTypeEnum.ADD, { date: defaultDate.format('YYYY-MM-DD') });
};
const getDataEvent = (val: WeeklyItem) => {
  handleShowAddModal(ModalTypeEnum.EDIT, {
    weeklyItem: val,
  });
};
const resetModalData = () => {
  addCalendarDate.value = '';
  editWeeklyItem.value = undefined;
};
onBeforeMount(() => {
  pageParam.value = getPageParams();
  initData();
  console.log('===pageParam', pageParam.value);
});
</script>

<style lang="scss">
.calendar-btn {
  position: fixed;
  left: 600rpx;
  display: flex;
  width: 96rpx;
  height: 96rpx;
  align-items: center;
  justify-content: center;
  background: #1677ff;
  border-radius: 48rpx;
}
.header-select {
  :deep(.u-dropdown) {
    padding-right: 80rpx;
  }
  :deep(.u-dropdown__menu__item__text) {
    display: block;
    max-width: 162rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.week-select {
  :deep(.u-dropdown__menu__item__text) {
    font-size: 32rpx !important;
  }
}
.label-item {
  :deep(.u-input__input) {
    font-size: 32rpx !important;
  }
  :deep(.u-radio__label) {
    color: #000000e0 !important;
  }
  :deep(.uni-textarea-placeholder) {
    color: #00000073 !important;
  }
  :deep(.u-input__textarea) {
    padding: 0 !important;
    min-height: 40rpx !important;
  }
}
.checkbox-item {
  :deep(.u-checkbox) {
    width: 100%;
  }
  :deep(.u-checkbox__label) {
    width: 100%;
  }
}
</style>
