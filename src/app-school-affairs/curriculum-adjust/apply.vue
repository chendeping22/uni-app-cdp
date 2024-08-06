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
              <view
                v-for="cell in item.courseCells"
                :key="cell.id"
                class="course-cell flex-center"
                @click="handleSelect(cell)"
              >
                <view class="course-icon icon-48 flex-center no-shrink">
                  <image class="icon-32" :src="iconCourse" />
                </view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-name text-ellipse">
                    {{ cell.subjectName }}
                  </view>
                  <view class="course-extra">
                    {{ cell.clazzName }} {{ `第${cell.sortNo}节` }}
                  </view>
                </view>
              </view>
            </view>
            <view class="safe-area-inset-bottom"></view>
          </view>
          <view v-if="!loading && list.length === 0" class="h100 flex-center scroll-hidden">
            <u-empty-custom mode="search" class="color-base no-shrink" text="暂无任课安排~" />
          </view>
        </scroll-view>
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { debounce } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { onMounted, ref, unref } from 'vue';
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

function handleSelect(cell: any) {
  uni.navigateTo({
    url: '/app-school-affairs/curriculum-adjust/apply-2',
    success: function (res: any) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit(
        'acceptDataFromOpenerPage',
        unref({
          grade: currentGrade.value,
          sourceCourse: cell,
          currentWeek: currentWeek.value,
          semester: semester.value,
          weekList: weekList.value,
        }),
      );
    },
  });
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
  fetchListDebounce();
}
</script>

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
  padding: 24rpx 32rpx;
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
</style>
