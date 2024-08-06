<template>
  <view class="h100">
    <u-gap v-if="weekList.length > 0" height="24" />
    <view class="bg-white scroll-wrapper">
      <scroll-view scroll-y style="height: 100%; width: 100%">
        <view class="flex-column-plain" style="min-height: 100%">
          <Schedule
            v-if="currentWeek > -1 && weekList && weekList.length > 0 && weekList[currentWeek]"
            class="flex-stretch flex-column-plain"
            :list="dataMap[currentWeek]"
            :week-info="weekList[currentWeek]"
            :show-color="selectedColor"
            @show-detail="handleShowDetail"
          >
            <template v-if="isTeacher" #cell="{ cellData }">
              <view
                v-if="selectedCourse"
                class="w-148 plr-xxs text-center font-secondary text-ellipse"
              >
                {{ cellData?.subjectName || '' }}
              </view>
              <view class="w-148 plr-xxs text-center bold font-secondary text-ellipse">
                {{ cellData?.clazzName || '' }}
              </view>
              <view
                v-if="selectedSpace"
                class="w-148 plr-xxs text-center font-secondary text-ellipse"
              >
                {{ cellData?.spaceDesc || '' }}
              </view>
            </template>
            <template v-else #cell="{ cellData }">
              <view class="w-148 plr-xxs text-center bold font-secondary text-ellipse">
                {{ cellData?.subjectName || '' }}
              </view>
              <view
                v-if="selectedTeacher"
                class="w-148 plr-xxs text-center font-secondary text-ellipse"
              >
                {{ cellData?.teacherDesc || '' }}
              </view>
              <view v-if="selectedSpace" class="w-148 plr-xxs text-center font-desc text-ellipse">
                {{ cellData?.spaceDesc || '' }}
              </view>
            </template>
            <template #footer>
              <view v-if="dataMap[currentWeek] && dataMap[currentWeek].length > 0">
                <view class="flex-center h-128 plr-l ptb-s">
                  <view class="bold h-80 flex-center" style="font-size: 32rpx">展示设置</view>
                  <view
                    v-if="isTeacher"
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedCourse ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('course')"
                  >
                    课程
                  </view>
                  <view
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedSpace ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('space')"
                  >
                    场地
                  </view>
                  <view
                    v-if="!isTeacher"
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedTeacher ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('teacher')"
                  >
                    教师
                  </view>
                  <view
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedColor ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('color')"
                  >
                    颜色
                  </view>
                </view>
              </view>
            </template>
          </Schedule>
          <view v-if="isPersonal === 1" class="bg-white safe-area-inset-bottom" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { debounce } from '@/utils/lodash-es';
import { getPageParams } from '@/utils/tools';
import { onBeforeMount, onMounted, ref, unref, watch } from 'vue';
import {
  getStudentSchedule,
  getTeacherSchedule,
  getTeacherScheduleById,
} from '../services/curriculum-schedule';
import Schedule from './components/schedule.vue';

const props = defineProps<{
  semester: string;
  currentWeek: number;
  weekList: any[];
}>();
const emits = defineEmits(['showDetail']);
interface IPageParam {
  locationId?: string;
  userId?: string;
}
const pageParam = ref({} as IPageParam);
const currentUserType = loginStore().currentUserType;
const isPersonal = ref(-1);
const isTeacher = ref(false);
const isStudent = ref(false);
const isGuardian = ref(false);
const selectedCourse = ref(true);
const selectedSpace = ref(false);
const selectedTeacher = ref(true);
const selectedColor = ref(true);
const dataMap = ref<any>({});

watch(
  () => props.currentWeek,
  v => {
    getSchedule(v);
  },
);

function handleSelect(type: string) {
  if (type === 'course') {
    selectedCourse.value = !selectedCourse.value;
  } else if (type === 'space') {
    selectedSpace.value = !selectedSpace.value;
  } else if (type === 'teacher') {
    selectedTeacher.value = !selectedTeacher.value;
  } else if (type === 'color') {
    selectedColor.value = !selectedColor.value;
  }
}
const getSchedule = debounce(async (v: number) => {
  if (v === -1 || !props?.weekList[v]) {
    return;
  }

  const week = unref(props.weekList[v]);
  if (isTeacher.value) {
    const params: any = {
      startDate: week.startDate,
      endDate: week.endDate,
    };
    if (pageParam.value && pageParam.value.locationId && pageParam.value.userId) {
      params.locationId = pageParam.value.locationId;
      const res: any = await getTeacherScheduleById(pageParam.value.userId, params);
      dataMap.value[v] = res || [];
    } else {
      const res: any = await getTeacherSchedule(params);
      dataMap.value[v] = res || [];
    }
  } else if (isStudent.value) {
    const userInfo = loginStore().userInfo;
    if (!userInfo || !userInfo.personId) {
      return;
    }
    const res: any = await getStudentSchedule(userInfo.personId, {
      startDate: week.startDate,
      endDate: week.endDate,
    });
    dataMap.value[v] = res || [];
  } else if (isGuardian.value) {
    const userInfo = loginStore().userInfo;
    if (!userInfo || !userInfo.currentChildId) {
      return;
    }
    const res: any = await getStudentSchedule(userInfo.currentChildId, {
      startDate: week.startDate,
      endDate: week.endDate,
    });
    dataMap.value[v] = res || [];
  }
}, 200);
function handleShowDetail(data: any) {
  emits('showDetail', data);
}

onBeforeMount(() => {
  pageParam.value = getPageParams();
  // 支持教师通讯录查看教师课表
  if (pageParam.value && pageParam.value.locationId && pageParam.value.userId) {
    isTeacher.value = true;
    isGuardian.value = false;
    isStudent.value = false;
    isPersonal.value = 1;
  } else {
    isTeacher.value = currentUserType === EUserType.teacher;
    isGuardian.value = currentUserType == EUserType.guardian;
    isStudent.value = currentUserType == EUserType.student;
    isPersonal.value = currentUserType === EUserType.teacher ? 0 : 1;
  }
});

onMounted(() => {
  getSchedule(props.currentWeek);
});
</script>

<style lang="scss" scoped>
.scroll-wrapper {
  height: calc(100% - 24rpx);
}
</style>
