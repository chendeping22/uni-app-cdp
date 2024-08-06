<template>
  <view class="h100">
    <u-gap v-if="weekList.length > 0" height="24" />
    <view class="bg-white scroll-wrapper">
      <scroll-view scroll-y style="height: 100%; width: 100%">
        <view class="flex-column-plain" style="min-height: 100%">
          <picker
            v-if="pickerRange"
            mode="multiSelector"
            safe-area-inset-bottom
            :value="pickerValue.data"
            :range="pickerRange"
            @columnchange="handleColumnChange"
            @change="handlePickerChange"
          >
            <view class="bg-white flex-center h-72 relative" style="z-index: 1">
              <view
                v-if="locationClasses"
                class="font-title color-secondary mr-b text-ellipse"
                style="max-width: 580rpx"
              >
                {{ classInfo }}
              </view>
              <u-icon
                v-if="locationClasses"
                class="font-desc color-secondary"
                name="arrow-down-fill"
              />
            </view>
          </picker>
          <Schedule
            v-if="currentWeek > -1 && weekList && weekList.length > 0 && weekList[currentWeek]"
            class="flex-stretch flex-column-plain"
            :list="dataMap[currentWeek]"
            :week-info="weekList[currentWeek]"
            :show-color="selectedColor"
            @show-detail="handleShowDetail"
          >
            <template #cell="{ cellData }">
              <view class="w-148 plr-xxs text-center font-secondary text-ellipse">
                {{ cellData?.subjectName || '' }}
              </view>
              <view
                v-if="selectedTeacher"
                class="w-148 plr-xxs text-center bold font-secondary text-ellipse"
              >
                {{ cellData?.teacherDesc || '' }}
              </view>
              <view
                v-if="selectedSpace"
                class="w-148 plr-xxs text-center font-secondary text-ellipse"
              >
                {{ cellData?.spaceDesc || '' }}
              </view>
            </template>
            <template #footer>
              <view v-if="dataMap[currentWeek] && dataMap[currentWeek].length > 0">
                <view class="flex-center h-128 plr-l ptb-s">
                  <view class="bold h-80 flex-center" style="font-size: 32rpx">展示设置</view>
                  <view
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedSpace ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('space')"
                  >
                    场地
                  </view>
                  <view
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
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { debounce } from '@/utils/lodash-es';
import { computed, onMounted, reactive, ref, unref, watch } from 'vue';
import { getClassSchedule, getLocationClasses } from '../services/curriculum-schedule';
import Schedule from './components/schedule.vue';

const props = defineProps<{
  semester: string;
  currentWeek: number;
  weekList: any[];
}>();
const emits = defineEmits(['showDetail']);
const selectedSpace = ref(false);
const selectedTeacher = ref(true);
const selectedColor = ref(false);
const dataMap = ref<any>({});
const locationClasses = ref<any>();
const currentClass = ref<any>();
const classId = ref('');
const classInfo = ref('');
const pickerValue = reactive({ data: [0, 0, 0] });
const pickerRange = computed(() => {
  if (!locationClasses.value) {
    return null;
  }
  const list1: string[] = [];
  const list2: string[] = [];
  const list3: string[] = [];
  locationClasses.value.forEach((i: any, ii: number) => {
    list1.push(i.nodeName);
    if (pickerValue.data[0] === ii) {
      (i.childNodeList || []).forEach((j: any, ji: number) => {
        list2.push(j.nodeName);
        if (pickerValue.data[1] === ji) {
          (j.childNodeList || []).forEach((k: any) => {
            list3.push(k.nodeName);
          });
        }
      });
    }
  });

  return [list1, list2, list3];
});

watch(
  () => props.currentWeek,
  v => {
    getSchedule(v);
  },
);

function handleSelect(type: string) {
  if (type === 'space') {
    selectedSpace.value = !selectedSpace.value;
  } else if (type === 'teacher') {
    selectedTeacher.value = !selectedTeacher.value;
  } else if (type === 'color') {
    selectedColor.value = !selectedColor.value;
  }
}
const getSchedule = debounce(async (v: number) => {
  if (v === -1 || !props?.weekList[v] || !classId.value) {
    return;
  }

  const week = unref(props.weekList[v]);
  const res: any = await getClassSchedule(classId.value, {
    startDate: week.startDate,
    endDate: week.endDate,
  });
  dataMap.value[v] = res || [];
}, 200);
async function getClasses() {
  const userInfo = loginStore().userInfo;
  if (!userInfo?.locationId) {
    return;
  }
  const res: any = await getLocationClasses(userInfo?.locationId, 1);
  locationClasses.value = res.childNodeList;
  pickerValue.data = [0, 0, 0];
  currentClass.value = [0, 0, 0];
  updateClassInfo();
}

function updateClassInfo() {
  let res = '';
  if (!currentClass.value?.length) {
    classInfo.value = '';
    classId.value = '';
    return;
  }

  locationClasses.value.forEach((i: any, ii: number) => {
    if (currentClass.value[0] === ii) {
      res += i.nodeName;
      (i.childNodeList || []).forEach((j: any, ji: number) => {
        if (currentClass.value[1] === ji) {
          res += ' ' + (j.nodeName || '');
          (j.childNodeList || []).forEach((k: any, ki: number) => {
            if (currentClass.value[2] === ki) {
              res += ' ' + (k.nodeName || '');
              classId.value = k.nodeId;
            }
          });
        }
      });
    }
  });

  if (res) {
    res += ' 课表';
  }

  classInfo.value = res;
}

function handleColumnChange(e: any) {
  if (e && e.detail) {
    if (e.detail.column === 0) {
      pickerValue.data = [e.detail.value, 0, 0];
    } else if (e.detail.column === 1) {
      pickerValue.data[1] = e.detail.value;
      pickerValue.data[2] = 0;
    } else if (e.detail.column === 2) {
      pickerValue.data[2] = e.detail.value;
    }
  }
}
function handlePickerChange(e: any) {
  if (e.detail.value) {
    currentClass.value = [...e.detail.value];
  }
  updateClassInfo();
  getSchedule(props.currentWeek);
}
function handleShowDetail(data: any) {
  emits('showDetail', data);
}
onMounted(async () => {
  await getClasses();
  getSchedule(props.currentWeek);
});
</script>

<style lang="scss" scoped>
.scroll-wrapper {
  height: calc(100% - 24rpx);
}
</style>
