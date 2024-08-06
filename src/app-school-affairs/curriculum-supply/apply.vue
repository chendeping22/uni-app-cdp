<template>
  <page class="h100" custom-overflow="hidden">
    <view class="h100 flex-column-plain">
      <view
        v-if="grades.length > 1 && weekList && weekList.length > 0"
        class="bg-white grades-wrapper"
      >
        <u-dropdown
          ref="gradesDropdown"
          :height="'96rpx'"
          menu-icon="arrow-down-fill"
          border-radius="16"
        >
          <u-dropdown-item :title="(currentGrade.name || '切换任教年级') + ' '">
            <view class="bg-white plr-l">
              <scroll-view scroll-y style="width: 100%; max-height: calc(50vh)">
                <template v-for="(item, index) in grades" :key="item.id">
                  <view v-if="index > 0" class="list-divider"></view>
                  <view class="grade-item flex-between" @click="handleChangeGrade(item)">
                    <view class="grade-name" :class="currentGrade.id === item.id ? 'active' : ''">
                      {{ item.name }}
                    </view>
                    <view class="icon-48 flex-center">
                      <u-icon
                        v-if="currentGrade.id === item.id"
                        name="checkmark"
                        color="rgba(22, 119, 255, 1)"
                        size="40"
                      />
                    </view>
                  </view>
                </template>
              </scroll-view>
            </view>
          </u-dropdown-item>
        </u-dropdown>
      </view>
      <view
        v-if="grades.length > 0 && weekList && weekList.length > 0"
        class="bg-white shadow"
        style="height: 116rpx; position: relative; z-index: 2"
      >
        <WeekSwiper
          :semester="semester"
          :week-list="weekList"
          :current="currentWeek"
          @change="handleWeekChange"
        />
      </view>
      <view class="flex-stretch scroll-hidden">
        <scroll-view scroll-y style="height: 100%; width: 100%">
          <view v-if="list && list.length > 0" class="plr-l">
            <view class="tip-text ptb-b">已过滤存在调代课申请或多个任课老师的节次</view>
            <view v-for="item in list" :key="item.clazzDate" class="scroll-hidden">
              <view class="week-day">
                {{ weekText[item.dayOfWeek] }} {{ dayjs(item.clazzDate).format('MM-DD') }}
              </view>
              <view v-for="cell in item.courseCells" :key="cell.id" class="course-cell flex-center">
                <view class="course-icon icon-48 flex-center no-shrink">
                  <image class="icon-32" :src="iconCourse" />
                </view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-name text-ellipse">
                    {{ cell.subjectName }}
                  </view>
                  <view class="course-extra text-ellipse">
                    {{ cell.clazzName }} {{ `第${cell.sortNo}节` }}
                  </view>
                </view>
                <view
                  class="course-select ml-l flex-center h100 p-all-l no-shrink"
                  @click.stop="handleSelect(item, cell)"
                >
                  <radio
                    class="curriculum-supply-radio"
                    :checked="
                      !!selectedCourses.cellKeys.find(i => i === `${item.clazzDate}_${cell.id}`)
                    "
                    color="#176BFB"
                    style="margin: 0"
                    @click.stop="handleSelect(item, cell)"
                  />
                </view>
              </view>
            </view>
          </view>
          <view v-if="!loading && list.length === 0" class="h100 flex-center scroll-hidden">
            <u-empty-custom mode="search" class="color-base no-shrink" text="暂无任课安排~" />
          </view>
        </scroll-view>
      </view>
      <view
        v-if="weekList && weekList.length > 0 && grades && grades.length > 0"
        class="bg-white no-shrink ptb-b plr-l bottom-shadow"
      >
        <view class="flex-center">
          <view class="button-preview flex-center" @click="handlePreview">
            查看已选({{ selectedCourses.cellKeys.length }})
          </view>
          <view class="button-agree flex-center" @click="handleConfirm">确定</view>
        </view>
        <view class="bg-white no-shrink safe-area-inset-bottom"></view>
      </view>
    </view>
  </page>
  <u-popup
    v-model="showSelected"
    mode="bottom"
    closeable
    class="curriculum-popup-content"
    safe-area-inset-bottom
  >
    <view class="popup-content">
      <view class="popup-title flex-center">
        {{ `已选(${selectedCourses.cellKeys.length})` }}
      </view>
      <view class="popup-container">
        <scroll-view scroll-y style="height: 100%; width: 100%">
          <view class="plr-l">
            <view v-for="item in selectList" :key="item.clazzDate" class="scroll-hidden">
              <view class="week-day">
                {{ weekText[item.dayOfWeek] }} {{ dayjs(item.clazzDate).format('MM-DD') }}
              </view>
              <view v-for="cell in item.courseCells" :key="cell.id" class="course-cell flex-center">
                <view class="course-icon icon-48 flex-center no-shrink">
                  <image class="icon-32" :src="iconCourse" />
                </view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-name text-ellipse">
                    {{ cell.subjectName }}
                  </view>
                  <view class="course-extra text-ellipse">
                    {{ cell.clazzName }} {{ `第${cell.sortNo}节` }}
                  </view>
                </view>
                <view
                  class="course-select ml-l flex-center h100 p-all-l no-shrink"
                  @click.stop="handleSelect(item, cell)"
                >
                  <radio
                    class="curriculum-supply-radio"
                    :checked="
                      !!selectedCourses.cellKeys.find(i => i === `${item.clazzDate}_${cell.id}`)
                    "
                    color="#176BFB"
                    style="margin: 0"
                    @click.stop="handleSelect(item, cell)"
                  />
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </u-popup>
</template>

<script lang="ts" setup>
import { cloneDeep, debounce } from '@/utils/lodash-es';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { onMounted, reactive, ref, unref } from 'vue';
import WeekSwiper from '../curriculum-schedule/components/week-swiper.vue';
import { getAllTeachingGrades, getTeacherDateList } from '../services/curriculum-adjust';
import { getWeekList } from '../services/curriculum-schedule';
import iconCourse from '../static/course-info/course-icon.svg';

const semester = ref('');
const weekList = ref<any[]>();
const currentWeek = ref<number>(-1);
const grades = ref<any[]>([]);
const gradesDropdown = ref();
const currentGrade = ref<any>();
const list = ref<any[]>([]);
const loading = ref(true);
const weekText = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const selectedCourses = reactive<any>({
  list: [],
  cellKeys: [],
});
const selectList = ref<any[]>([]);
const showSelected = ref(false);

function sortCellsByNo(list: any) {
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i; j < list.length; j += 1) {
      if (list[i].sortNo > list[j].sortNo) {
        const _t = list[i];
        list[i] = list[j];
        list[j] = _t;
      }
    }
  }
  return list;
}

function sortListByDay(list: any) {
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i; j < list.length; j += 1) {
      const timeI = dayjs(list[i].clazzDate).valueOf();
      const timeJ = dayjs(list[j].clazzDate).valueOf();
      if (timeI > timeJ) {
        const _t = list[i];
        list[i] = list[j];
        list[j] = _t;
      }
    }
  }
  return list;
}

function handleSelect(item, cell: any) {
  const currentKey = item.clazzDate + '_' + cell.id;
  const _day = selectedCourses.list.find(i => i.clazzDate === item.clazzDate);
  if (_day) {
    const _cell = _day.courseCells.find(i => i.id === cell.id);
    if (_cell) {
      _day.courseCells = _day.courseCells.filter(i => i.id !== cell.id);
      if (_day.courseCells.length === 0) {
        selectedCourses.list = selectedCourses.list.filter(i => i.clazzDate !== item.clazzDate);
      }
      selectedCourses.cellKeys = selectedCourses.cellKeys.filter(i => i !== currentKey);
    } else {
      _day.courseCells = sortCellsByNo([...unref(_day.courseCells), unref(cell)]);
      selectedCourses.cellKeys.push(currentKey);
    }
  } else {
    selectedCourses.list = sortListByDay([
      ...unref(selectedCourses.list),
      { ...item, courseCells: [unref(cell)] },
    ]);
    selectedCourses.cellKeys.push(currentKey);
  }
}

async function fetchList() {
  const data: any = {
    onlyQueryOneGradeCourse: true,
    needQueryProcessingApply: true,
  };
  if (currentGrade.value && currentGrade.value.id) {
    data.gradeId = currentGrade.value.id;
  }
  const week = (weekList.value || [])[currentWeek.value];
  if (week) {
    data.startDate = week.startDate;
    data.endDate = week.endDate;
  } else {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const res: any = await getTeacherDateList(data);
    loading.value = false;
    list.value = res || [];
  } catch (error) {
    loading.value = false;
  }
}

const fetchListDebounce = debounce(() => {
  fetchList();
}, 200);

onMounted(() => {
  // 获取周列表
  try {
    getWeekList({}).then((res: any) => {
      const schoolYear = (res || []).find((i: any) => i.defaultFlag);
      semester.value = schoolYear?.schoolYear || '';
      if (schoolYear && schoolYear.schoolTerms && schoolYear.schoolTerms.length > 0) {
        const schoolTerm: any = schoolYear.schoolTerms.find((i: any) => i.defaultFlag);
        if (schoolTerm?.termNo === 1) {
          semester.value += '上学期';
        } else if (schoolTerm?.termNo === 2) {
          semester.value += '下学期';
        }
        if (schoolTerm && schoolTerm.schoolWeeks && schoolTerm.schoolWeeks.length > 0) {
          weekList.value = schoolTerm.schoolWeeks || [];
          schoolTerm.schoolWeeks.forEach((i: any, index: number) => {
            if (i.defaultFlag) {
              currentWeek.value = index;
            }
          });
        } else {
          weekList.value = [];
        }
      } else {
        weekList.value = [];
      }

      fetchList();
    });
    getAllTeachingGrades().then((res: any) => {
      grades.value = res || [];
      currentGrade.value = res[0];
    });
  } catch (error) {
    weekList.value = [];
    console.log(error);
  }
});

function handleWeekChange(v: number) {
  currentWeek.value = v;
  fetchListDebounce();
}
function handleChangeGrade(grade: any) {
  if (currentGrade.value && currentGrade.value.id === grade.id) {
    return;
  }
  currentGrade.value = grade;
  if (gradesDropdown.value) {
    gradesDropdown.value.close();
  }

  selectedCourses.list = [];
  selectedCourses.cellKeys = [];
  fetchListDebounce();
}
function handlePreview() {
  if (selectedCourses.cellKeys.length) {
    showSelected.value = true;
    selectList.value = cloneDeep(unref(selectedCourses.list));
  }
}
function handleConfirm() {
  if (!selectedCourses.cellKeys.length) {
    showInfo('请先选择需要代课的课程');
    return;
  }
  uni.navigateTo({
    url: '/app-school-affairs/curriculum-supply/apply-2',
    success: function (res: any) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit(
        'acceptDataFromOpenerPage',
        unref({
          grade: currentGrade.value,
          sourceCourse: cloneDeep(unref(selectedCourses.list)),
          currentWeek: currentWeek.value,
          semester: semester.value,
          weekList: weekList.value,
        }),
      );
    },
  });
}
</script>

<style lang="scss">
.curriculum-supply-radio {
  :deep(.uni-radio-input) {
    margin-right: 0;
  }
}

.curriculum-popup-content {
  :deep(.u-drawer-content) {
    border-radius: 16rpx 16rpx 0 0 !important;
    overflow: hidden;
  }
  .popup-title {
    height: 96rpx;
    background-color: #ffffff;
    font-size: 34rpx;
    line-height: 48rpx;
    text-align: center;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.88);
  }
  .popup-content {
    background-color: rgba(245, 245, 245, 1);
  }
  .popup-container {
    height: 648rpx;
  }
}
</style>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}
.grades-wrapper {
  height: 96rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.grade-item {
  height: 96rpx;
  .grade-name {
    font-size: 32rpx;
    color: rgba(0, 0, 0, 0.88);
    &.active {
      color: rgba(22, 119, 255, 1);
    }
  }
}
.list-divider {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.tip-text {
  font-size: 26rpx;
  line-height: 36rpx;
  color: rgba(0, 0, 0, 0.65);
}
.week-day {
  height: 64rpx;
  line-height: 64rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}
.course-cell {
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  height: 128rpx;
  padding: 0 0 0 32rpx;
  .course-icon {
    border-radius: 8rpx;
    background-color: rgba(22, 119, 255, 1);
    margin-right: 32rpx;
  }
  .course-name {
    font-size: 32rpx;
    color: rgba(0, 0, 0, 0.88);
    line-height: 44rpx;
  }
  .course-extra {
    font-size: 26rpx;
    line-height: 36rpx;
    color: rgba(0, 0, 0, 0.45);
  }
}
.bottom-shadow {
  z-index: 2;
  box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.08);
}
.button-preview {
  border-radius: 16rpx;
  height: 80rpx;
  color: rgba(0, 0, 0, 0.88);
  text-align: center;
  line-height: 40rpx;
  font-weight: 500;
  font-size: 30rpx;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex: 1;
}
.button-agree {
  margin-left: 24rpx;
  border-radius: 16rpx;
  height: 80rpx;
  color: #ffffff;
  text-align: center;
  line-height: 40rpx;
  font-weight: 500;
  font-size: 30rpx;
  background-color: rgba(22, 119, 255, 1);
  flex: 1;
}
</style>
