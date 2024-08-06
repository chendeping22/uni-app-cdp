<template>
  <u-modal v-model="state.show" title="分发" :show-confirm-button="false">
    <view style="padding: 0 20rpx">
      <u-gap height="20" bg-color="#ffffff" />
      <view class="card-column-item">
        <view class="card-col-label">填报人员</view>
        <view class="select-field-wrapper">
          <view class="select-field" @click="() => handleSelect('person')">
            <view class="font-size">{{ getSelectName('person') }}</view>
            <view
              v-if="selectedData.persons.value.length > 0"
              class="select-field-clear"
              @click.stop="() => handleClear('person')"
            >
              <u-icon name="close" class="select-clear-icon" />
            </view>
            <u-icon v-else name="arrow-down" class="select-field-icon" />
          </view>
        </view>
      </view>
      <view class="card-column-item">
        <view class="card-col-label"> 填报单位 </view>
        <view class="select-field-wrapper">
          <view class="select-field" @click="() => handleSelect('organization')">
            <view class="font-size">{{ getSelectName('organization') }}</view>
            <view
              v-if="selectedData.locations.value.length > 0"
              class="select-field-clear"
              @click.stop="() => handleClear('organization')"
            >
              <u-icon name="close" class="select-clear-icon" />
            </view>
            <u-icon v-else name="arrow-down" class="select-field-icon" />
          </view>
        </view>
      </view>
      <view class="card-column-item">
        <view class="card-col-label">
          填报学生
          <u-checkbox v-model="state.checked" shape="circle" class="marL">是否家长代填</u-checkbox>
        </view>
        <view class="select-field-wrapper">
          <view class="select-field" @click="() => handleSelect('student')">
            <view class="font-size">{{ getSelectName('student') }}</view>
            <view
              v-if="selectedData.students.value.length > 0"
              class="select-field-clear"
              @click.stop="() => handleClear('student')"
            >
              <u-icon name="close" class="select-clear-icon" />
            </view>
            <u-icon v-else name="arrow-down" class="select-field-icon" />
          </view>
        </view>
      </view>
      <u-gap height="40" bg-color="#ffffff" />
    </view>
    <view class="flex">
      <u-button style="width: 45%" @click="handleClose">取消</u-button>
      <u-button style="width: 45%" type="primary " :disabled="disabledBtn" @click="handleSubmit">
        确定
      </u-button>
    </view>
  </u-modal>
</template>

<script lang="ts" setup>
import showSelector from '@/components/selector/show-selector';
import { LocationScopeEnum, SelectorTypeEnum } from '@/components/selector/types';
import { reactive, ref, watch } from 'vue';
import { dispatchApi, selectExclude } from '../../services/fill-report';

const emit = defineEmits(['update:modelValue', 'dispatchSuccess']);
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  flowBeforeId: { type: String, default: '' },
  fillReportId: { type: String, default: '' },
});
const orgList = ref<string[]>([]);
const stuList = ref<string[]>([]);
const userList = ref<string[]>([]);
const disabledBtn = ref(false);
const state = reactive({
  show: props.modelValue,
  showSelector: false,
  selectType: '',
  checked: false,
  persons: [] as string[],
  organizations: [] as string[],
  students: [] as string[],
});
const getDisabledItemIds = () => {
  selectExclude(props.fillReportId).then((res: any) => {
    const { org, stu, user } = res;
    orgList.value = org;
    userList.value = user;
    let studentIds: string[] = [];
    (stu || []).forEach(i => {
      studentIds = [...studentIds, ...(i.list || [])];
    });
    stuList.value = studentIds;
  });
};

watch(
  () => props.modelValue,
  newValue => {
    state.show = newValue;
    if (newValue) {
      getDisabledItemIds();
    }
  },
);

const selectedData = reactive<any>({
  locations: {
    value: [],
    data: [],
  },
  students: {
    value: [],
    data: [],
  },
  persons: {
    value: [],
    data: [],
  },
});
function handleSelect(type: string) {
  let params: any = null;
  if (type === 'person') {
    params = {
      type: SelectorTypeEnum.acrossLocationPerson,
      multiple: true,
      value: selectedData.persons.value,
      scope: LocationScopeEnum.descendant,
      disabledItemIds: userList.value,
      callback: (value: any, data: any) => {
        selectedData.persons.value = value;
        selectedData.persons.data = data;
      },
    };
  } else if (type === 'organization') {
    params = {
      type: SelectorTypeEnum.location,
      multiple: true,
      value: selectedData.locations.value,
      scope: LocationScopeEnum.descendant,
      disabledItemIds: orgList.value,
      callback: (value: any, data: any) => {
        selectedData.locations.value = value;
        selectedData.locations.data = data;
      },
    };
  } else if (type === 'student') {
    params = {
      type: SelectorTypeEnum.studentScope,
      multiple: true,
      value: selectedData.students.value,
      disabledItemIds: stuList.value,
      callback: (value: any, data: any) => {
        selectedData.students.value = value;
        selectedData.students.data = data;
      },
    };
  } else {
    return;
  }
  showSelector(params);
}
function getSelectName(type: string) {
  if (type === 'person' && selectedData.persons.value.length > 0) {
    return selectedData.persons.data.map((i: any) => i.name).join(',');
  } else if (type === 'organization' && selectedData.locations.value.length > 0) {
    return selectedData.locations.data.map((i: any) => i.name).join(',');
  } else if (type === 'student' && selectedData.students.value.length > 0) {
    return selectedData.students.data.map((i: any) => i.name).join(',');
  }
  return '请选择';
}
function handleClear(type: string) {
  if (type === 'person') {
    selectedData.persons.value = [];
    selectedData.persons.data = [];
  } else if (type === 'organization') {
    selectedData.locations.value = [];
    selectedData.locations.data = [];
  } else if (type === 'student') {
    selectedData.students.value = [];
    selectedData.students.data = [];
  }
}
const clearData = () => {
  selectedData.persons.value = [];
  selectedData.persons.data = [];
  selectedData.locations.value = [];
  selectedData.locations.data = [];
  selectedData.students.value = [];
  selectedData.students.data = [];
};
function handleClose() {
  clearData();
  state.show = false;
  emit('update:modelValue', false);
}
function handleSubmit() {
  disabledBtn.value = true;
  //students,locations,persons至少有一个值不是空
  if (
    selectedData.students.value.length !== 0 ||
    selectedData.locations.value.length !== 0 ||
    selectedData.persons.value.length !== 0
  ) {
    const students = selectedData.students.data;

    const studentVo: any = {};
    students.forEach(item => {
      if (item.level === 1) {
        // 学校
        studentVo.locationIds
          ? studentVo.locationIds.push(item.id)
          : (studentVo.locationIds = [item.id]);
      } else if (item.level === 2) {
        // 学段
        studentVo.sectionIds
          ? studentVo.sectionIds.push(item.id)
          : (studentVo.sectionIds = [item.id]);
      } else if (item.level === 3) {
        // 年段
        studentVo.gradeIds ? studentVo.gradeIds.push(item.id) : (studentVo.gradeIds = [item.id]);
      } else if (item.level === 4) {
        // 班级
        studentVo.clazzIds ? studentVo.clazzIds.push(item.id) : (studentVo.clazzIds = [item.id]);
      } else if (item.level === 5) {
        // 学生
        studentVo.studentIds
          ? studentVo.studentIds.push(item.id)
          : (studentVo.studentIds = [item.id]);
      }
    });

    const data = {
      fillReportId: props.fillReportId,
      flowBeforeId: props.flowBeforeId,
      studentVo,
      userIds: selectedData.persons.value,
      orgIds: selectedData.locations.value,
      parentsFillReport: state.checked,
    };
    dispatchApi(data).then(res => {
      uni.showToast({
        title: res as string,
        duration: 2000,
        icon: 'none',
      });

      emit('update:modelValue', false);
      emit('dispatchSuccess', true);
      clearData();
      disabledBtn.value = false;
    });
  } else {
    uni.showToast({
      title: '请选择分发对象',
      duration: 2000,
      icon: 'none',
    });
    disabledBtn.value = false;
  }
}
</script>

<style lang="scss" scoped>
.card-column-item {
  width: 100%;
  overflow: hidden;
}
.card-col-label {
  color: rgba(0, 0, 0, 0.88);
  font-size: 30rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.select-field-wrapper {
  display: flex;
  align-items: flex-start;
}
.select-field {
  flex: 1;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  padding: 17rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 16rpx;
}
.select-field-icon {
  margin-top: 4rpx;
  font-size: 22rpx;
}
.select-field-clear {
  align-self: flex-start;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
}
.select-clear-icon {
  height: 35rpx;
  width: 35rpx;
  font-size: 15rpx;
  background-color: #909399;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  overflow: hidden;
}
.font-size {
  font-size: 28rpx;
  line-height: 36rpx;
}
.marL {
  margin-left: 20rpx;
}
.flex {
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
</style>
