<template>
  <view class="header-container">
    <view :class="`header-select ${props.isGuide ? 'is-guide' : ''}`">
      <view class="header-select-item" @click="() => handleHeaderPopShow(0)">
        <view
          :class="`header-select-text ${sectionTypeOptions.length <= 1 ? 'large' : ''} ${
            headerPopIndex === 0 && headerPopShow === true ? 'checked' : ''
          }`"
          >{{ schoolYearVal }}</view
        >
        <u-icon
          size="24"
          :color="`${headerPopIndex === 0 && headerPopShow === true ? '#1677ff' : '#00000073'}`"
          :name="`${
            headerPopIndex === 0 && headerPopShow === true ? 'arrow-up-fill' : 'arrow-down-fill'
          }`"
        />
      </view>
      <view
        v-if="!edu && sectionTypeOptions.length > 1"
        class="header-select-item"
        @click="() => handleHeaderPopShow(1)"
      >
        <view
          :class="`header-select-text ${
            headerPopIndex === 1 && headerPopShow === true ? 'checked' : ''
          }`"
          >{{ SectionTypesEnum[facultyVal] }}</view
        >
        <u-icon
          size="24"
          :color="`${headerPopIndex === 1 && headerPopShow === true ? '#1677ff' : '#00000073'}`"
          :name="`${
            headerPopIndex === 1 && headerPopShow === true ? 'arrow-up-fill' : 'arrow-down-fill'
          }`"
        />
      </view>
      <view class="header-select-item" @click="() => handleShowQuerySelect()">
        <view
          :class="`header-select-text ${sectionTypeOptions.length <= 1 ? 'large' : ''} ${
            headerPopIndex === 2 && headerPopShow === true ? 'checked' : ''
          }`"
          >{{ queryTitle }}</view
        >
        <u-icon
          size="24"
          :color="`${headerPopIndex === 2 && headerPopShow === true ? '#1677ff' : '#00000073'}`"
          :name="`${
            headerPopIndex === 2 && headerPopShow === true ? 'arrow-up-fill' : 'arrow-down-fill'
          }`"
        />
      </view>
      <view class="view-modal" @click="() => handleType(!typeVal)">
        <u-icon size="38" color="#00000073" :name="typeVal ? 'calendar' : 'list'"></u-icon>
      </view>
      <u-popup
        v-model="headerPopShow"
        mode="top"
        :custom-style="{
          top: '96rpx',
        }"
        :mask-custom-style="{
          top: '240rpx',
        }"
        @close="headerPopShow = false"
      >
        <view v-if="headerPopIndex === 0" class="slot-content" style="background-color: #ffffff">
          <scroll-view scroll-y="true" style="max-height: 570rpx">
            <view
              v-for="(item, index) in props.schoolCalendarData"
              :key="index"
              class="item-box"
              @click="handleSchoolYear(item)"
            >
              <view class="title-box">
                <text :class="`title ${curCalendar.name === item.name ? 'checked' : ''}`">{{
                  item.name
                }}</text>
                <u-tag
                  v-if="isDateRanger(item.endDate, item.startDate)"
                  text="当前"
                  mode="light"
                  size="mini"
                />
              </view>
              <view v-if="!edu" class="sub-text">
                {{ `起始日期:${item.startDate}~${item.endDate}` }}
              </view>
              <view v-if="!edu" class="sub-text">
                {{ `适用年级: ${getSectionTypeText(item.sectionTypes)}` }}
              </view>
              <u-icon
                v-if="curCalendar.name === item.name"
                :class="`drop-select ${edu ? 'small' : ''}`"
                name="checkbox-mark"
              />
            </view>
          </scroll-view>
        </view>
        <view v-if="headerPopIndex === 1" class="slot-content" style="background-color: #ffffff">
          <scroll-view scroll-y="true">
            <view
              v-for="(item, index) in sectionTypeOptions"
              :key="index"
              class="item-box"
              @click="handleSectionQuery(item)"
            >
              <view class="title-box">
                <text :class="`title ${facultyVal === item.value ? 'checked' : ''}`">{{
                  item.label
                }}</text>
              </view>
              <u-icon
                v-if="facultyVal === item.value"
                class="drop-select small"
                name="checkbox-mark"
              />
            </view>
          </scroll-view>
        </view>
        <view v-if="headerPopIndex === 2" class="query-container">
          <view class="query-item-box">
            <view
              v-for="(item, index) in edu ? eduOptions : options"
              :key="index"
              :class="`query-item ${isChecked(item) ? 'checked' : ''}`"
              @click="handleQuerySelect(item)"
            >
              {{ item.label }}
            </view>
          </view>
          <view class="button-container">
            <u-button class="btn" :plain="true" type="primary" @click="resetQuery">重置</u-button>
            <u-button class="btn" type="primary" @click="closeDropdown">查询</u-button>
          </view>
        </view>
      </u-popup>
    </view>
    <view class="week-select">
      <view
        :style="`z-index: ${zIndex === -1 ? zIndex : 20}`"
        class="pre-week"
        @click="() => onPreNextWeek('pre')"
      >
        <u-icon name="arrow-left" />
      </view>
      <view :style="`position:relative; ${zIndex === -1 ? 'z-index:-1' : ''}`">
        <u-dropdown ref="weekDropRef" title-size="26" @open="popClose">
          <u-dropdown-item v-model="weekVal" :title="weekItem?.weekName" class="school-calendar">
            <view class="slot-content" style="background-color: #ffffff">
              <scroll-view scroll-y="true" style="height: 600rpx">
                <view
                  v-for="(item, index) in curCalendar.schoolWeeks"
                  :key="index"
                  class="week-item-box"
                  @click="onChangeWeek(item)"
                >
                  <view :class="`title ${weekItem?.weekNo === item.weekNo ? 'checked' : ''}`"
                    >{{ item.weekName }}
                    <text class="sub-text">{{
                      `（${item.startDate}~${item.endDate}）`
                    }}</text></view
                  >
                  <u-tag
                    v-if="isDateRanger(item.endDate, item.startDate)"
                    text="当前"
                    mode="light"
                    size="mini"
                  />
                  <u-icon
                    v-if="weekItem?.weekNo === item.weekNo"
                    class="drop-select"
                    name="checkbox-mark"
                  />
                </view>
              </scroll-view>
            </view>
          </u-dropdown-item>
        </u-dropdown>
      </view>

      <view
        :style="`z-index: ${zIndex === -1 ? zIndex : 20}`"
        class="next-week"
        @click="() => onPreNextWeek('next')"
      >
        <u-icon name="arrow-right" />
      </view>
    </view>
    <u-toast ref="weeklyHeaderToast" />
  </view>
</template>

<script lang="ts" setup>
import { getPageParams, isEdu, showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { onMounted, ref, watch, type PropType } from 'vue';
import {
  IWeek,
  NavFormData,
  QueryTypeTextEnum,
  SectionTypesEnum,
  type WeeklyCalendarsItem,
} from '../constants/index';
const props = defineProps({
  schoolCalendarData: {
    type: Array as PropType<WeeklyCalendarsItem[]>,
    default: () => [],
  },
  isGuide: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
    default: '',
  },
  // currentWeekNo: Number,
});
// 定义暴露给外部组件的方法
const emit = defineEmits<{
  (e: 'change', data: NavFormData): void;
  (e: 'clickImport'): void;
  (e: 'add', date: string): void;
  (e: 'showSettingModal'): void;
}>();
const schoolYearVal = ref<string | null>(null); // 学年学期
const curCalendar = ref<WeeklyCalendarsItem>({
  defaultFlag: 0,
  schoolWeeks: [],
  sectionTypes: [],
  startDate: '',
  endDate: '',
  name: '',
  defaultSectionType: null,
});
const dropDownRef = ref();
const weekDropRef = ref();
const zIndex = ref(1);
const weeklyHeaderToast = ref();
const headerPopIndex = ref(-1);
const headerPopShow = ref(false);
const headerQueryShow = ref(false);
const pageParam = ref();

const weekVal = ref<number>();
const weekItem = ref<IWeek>();
const typeVal = ref(true);
const facultyVal = ref();
const queryTypeArr = ref<(number | null)[]>([null]);
const edu = isEdu();
const options = ref([
  { value: null, label: '全部日程' },
  { value: 1, label: '个人日程' },
  { value: 2, label: '本部门负责' },
  { value: 3, label: '本人负责' },
  { value: 4, label: '本人参与' },
  { value: 5, label: '课程表' },
  { value: 6, label: '会议' },
]);
const eduOptions = ref([
  { value: null, label: '全部日程' },
  { value: 1, label: '个人日程' },
  { value: 2, label: '本部门负责' },
  { value: 3, label: '本人负责' },
  { value: 4, label: '本人参与' },
  { value: 6, label: '会议' },
]);
const sectionTypeOptions = ref([]);
const queryTitle = ref('全部日程');
// 切换校历
const handleSchoolYear = (item: WeeklyCalendarsItem) => {
  schoolYearVal.value = item.name;
  curCalendar.value = item;
  getSelectedSchoolYearCalendar();
  emitFormChange();
  popClose();
};
// 导航数据变更后,通知父级组件
const emitFormChange = () => {
  emit('change', {
    curCalendar: curCalendar.value,
    curWeekItem: weekItem.value,
    curFaculty: facultyVal.value,
    viewType: typeVal.value,
    queryType: queryTypeArr.value,
  });
};
// 获取头部导航数据
const getSelectedSchoolYearCalendar = (data?: WeeklyCalendarsItem[]) => {
  if (data) {
    const calendarItem = data.find(item => item.defaultFlag === 1);
    if (calendarItem) {
      schoolYearVal.value = calendarItem.name; //  初始化当前选中校历
      curCalendar.value = calendarItem; // 获取当前选中校历详细信息
    }
  }
  // 获取校历周数 和默认选中周
  if (curCalendar.value.schoolWeeks.length > 0) {
    const weekData =
      curCalendar.value.schoolWeeks.find(ele => ele.defaultFlag === 1) ||
      curCalendar.value.schoolWeeks[0];
    weekItem.value = weekData;
    weekVal.value = weekItem.value.weekNo;
  }

  // 设置默认学部
  if (curCalendar.value.sectionTypes.length > 0) {
    facultyVal.value =
      curCalendar.value.defaultSectionType !== null
        ? curCalendar.value.defaultSectionType
        : curCalendar.value.sectionTypes[0];
    sectionTypeOptions.value = getSectionTypeOption(curCalendar.value.sectionTypes);
  }

  const { queryType } = pageParam.value;
  if (queryType) {
    queryTypeArr.value = JSON.parse(queryType);
    queryTitle.value = getQueryTypeText();
  }
};
const handleHeaderPopShow = (index: number) => {
  if (headerPopShow.value && index === headerPopIndex.value) {
    popClose();
  } else {
    headerPopIndex.value = index;
    headerPopShow.value = true;
  }
  weekDropRef.value.close();
};
const popClose = () => {
  headerPopIndex.value = -1;
  headerPopShow.value = false;
};
// 切换周
const onChangeWeek = (item: IWeek) => {
  weekVal.value = item.weekNo;
  weekItem.value = item;
  emitFormChange();
  weekDropRef.value.close();
};
// pre, next
const onPreNextWeek = (type: string) => {
  const weekArr = curCalendar.value.schoolWeeks;
  const lastWeekNo = weekArr[weekArr.length - 1].weekNo;
  if (type === 'pre') {
    if (weekVal.value && weekVal.value > 1) {
      weekVal.value = weekVal.value - 1;
      weekItem.value = curCalendar.value.schoolWeeks.find(
        (item: IWeek) => item.weekNo === weekVal.value,
      );

      emitFormChange();
    } else {
      weeklyHeaderToast.value.show({
        title: '已经是第一周啦～',
        type: 'default',
      });
    }
  }
  if (type === 'next') {
    if (weekVal.value && weekVal.value < lastWeekNo) {
      weekVal.value = weekVal.value + 1;
      weekItem.value = curCalendar.value.schoolWeeks.find(
        (item: IWeek) => item.weekNo === weekVal.value,
      );

      emitFormChange();
    } else {
      weeklyHeaderToast.value.show({
        title: '已经是最后一周啦～',
        type: 'default',
      });
    }
  }
};
// 切换日程类型
const handleQuerySelect = (item: any) => {
  if (item.value === null) {
    queryTypeArr.value = [item.value];
  } else {
    // 过滤不重复选项
    const index = queryTypeArr.value.findIndex((num: number | null) => {
      return num === item.value;
    });
    if (index === -1) {
      if (queryTypeArr.value.length === 1 && queryTypeArr.value[0] === null) {
        queryTypeArr.value = [item.value];
      } else {
        queryTypeArr.value.push(item.value);
      }
    } else {
      queryTypeArr.value.splice(index, 1);
    }
    console.log('===index', index, queryTypeArr.value);
    // queryTypeArr.value = filterSelected;
  }
};
const isChecked = (item: any) => {
  const index = queryTypeArr.value.findIndex((num: number | null) => {
    return num === item.value;
  });
  return index === -1 ? false : true;
};
const resetQuery = () => {
  queryTypeArr.value = [null];
  closeDropdown();
};
const getQueryTypeText = () => {
  const arrText = queryTypeArr.value.map((ele: number | null) => {
    if (ele === null) {
      return QueryTypeTextEnum[0];
    } else {
      return QueryTypeTextEnum[ele];
    }
  });
  return arrText.join(',');
};
//选择日程类型
const closeDropdown = () => {
  queryTitle.value = getQueryTypeText();
  console.log('==text', queryTitle.value);
  popClose();
  emitFormChange();
};
// 切换学部
const handleSectionQuery = (item: any) => {
  facultyVal.value = item.value;
  emitFormChange();
  popClose();
};
const getSectionTypeText = (arr: number[]) => {
  const arrText = arr.map((item: number) => {
    return SectionTypesEnum[item];
  });
  return arrText.join(',');
};

const getSectionTypeOption = (arr: number[]) => {
  const options: any = [];
  arr.forEach(ele => {
    options.push({ label: SectionTypesEnum[ele], value: ele });
  });
  return options;
};
const handleType = (val: boolean) => {
  if (!schoolYearVal.value) return;
  typeVal.value = val;
  emitFormChange();
};
const handleHeaderOpen = () => {
  zIndex.value = -1;
};
const handleHeaderClose = () => {
  zIndex.value = 0;
  dropDownRef.value.close();
  weekDropRef.value.close();
};
// 判断时间范围
function isDateRanger(endDate: string, startDate: string, targetDate?: string) {
  const target = targetDate ? dayjs(targetDate) : dayjs();
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return target.isBefore(end) && target.isAfter(start);
}
const initCalendarData = (data: WeeklyCalendarsItem[]) => {
  getSelectedSchoolYearCalendar(data);
  emitFormChange();
};
//
const handleShowQuerySelect = () => {
  if (pageParam.value && pageParam.value.userId && pageParam.value.userId !== props.userId) {
    showInfo('暂无权限');
    return;
  }
  handleHeaderPopShow(2);
};
watch(
  () => props.schoolCalendarData,
  newProps => {
    initCalendarData(newProps);
  },
);

onMounted(() => {
  pageParam.value = getPageParams();
  initCalendarData(props.schoolCalendarData);
});
</script>

<style lang="scss" scoped>
.header-container {
  position: relative;
  background-color: #fff;
}
.slot-content {
  padding: 0 32rpx;
}
.item-box,
.week-item-box {
  position: relative;
  padding: 14px 0;
  border-bottom: 2rpx solid rgb(240, 240, 240);
}
.week-item-box {
  display: flex;
  align-items: center;
  .sub-text {
    font-size: 26rpx;
    color: #00000073;
  }
  .title {
    &.checked {
      color: #1677ff;
      .sub-text {
        color: #1677ff;
      }
    }
  }
  .drop-select {
    top: 24rpx;
  }
}
.title-box {
  display: flex;
  margin-bottom: 18rpx;
  align-items: center;
  .title {
    height: 44rpx;
    font-size: 32rpx;
    margin-right: 16rpx;
    &.checked {
      color: #1677ff;
    }
  }
}
.sub-text {
  font-size: 26rpx;
  height: 36rpx;
  line-height: 36rpx;
  color: #00000073;
}
.header-select {
  display: flex;
  align-items: center;
  padding-left: 20rpx;
  border-bottom: 2rpx solid #0000000a;
  &.is-guide {
    margin-top: 8rpx;
  }
  .header-select-item {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: #000000e0;
  }
  .header-select-text {
    margin-right: 16rpx;
    font-size: 26rpx;
    max-width: 162rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.large {
      max-width: 250rpx;
    }
    &.checked {
      color: #1677ff;
    }
  }
  height: 96rpx;
  :deep(.u-dropdown) {
    padding-right: 80rpx;
  }
  :deep(.u-dropdown__menu) {
    height: 96rpx !important;
  }
  :deep(.u-dropdown__menu__item__text) {
    display: block;
    max-width: 162rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.view-modal {
  height: 96rpx;
  width: 96rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}
.type-icon {
  width: 40rpx;
  height: 40rpx;
}
.week-select {
  position: relative;
  // z-index: -1;
  :deep(.u-dropdown) {
    padding-right: 0;
  }
}
.query-item-box {
  display: grid;
  padding: 32rpx;
  grid-template-columns: repeat(auto-fill, 212rpx);
  grid-row-gap: 24rpx;
  grid-column-gap: 24rpx;
  .query-item {
    display: flex;
    height: 80rpx;
    justify-content: center;
    align-items: center;
    background: #0000000a;
    border-radius: 8rpx;
    color: rgb(86, 86, 86);
    &.checked {
      background-color: #e6f4ff;
      color: #1677ff;
    }
  }
}
.button-container {
  display: flex;
  border-top: 2rpx solid #0000000f;
  padding: 24rpx 32rpx;
  justify-content: space-between;
  .btn {
    width: 330rpx;
    margin: 0;
  }
}
.drop-select {
  position: absolute;
  top: 48rpx;
  right: 0;
  width: 64rpx;
  height: 48rpx;
  color: #1677ff;
  &.small {
    top: 24rpx;
  }
}
.pre-week {
  left: 0;
}
.next-week {
  right: 0;
}
.pre-week,
.next-week {
  position: absolute;
  display: flex;
  top: 0;
  width: 80rpx;
  height: 80rpx;
  align-items: center;
  justify-content: center;
  color: #00000073;
  z-index: 20;
}
.query-container {
  background-color: #ffffff;
  max-height: 480rpx;
}
</style>
