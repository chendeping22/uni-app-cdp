<template>
  <u-popup
    v-model="modalOpen"
    class="container"
    mode="bottom"
    border-radius="16"
    :mask-close-able="true"
    @close="close"
  >
    <view class="title-container">
      <view class="title-back" @click="close"
        ><u-icon name="arrow-left" size="40" color="#000000E0"
      /></view>
      <text>{{ `${modalType === ModalTypeEnum.ADD ? '添加' : '编辑'}事项日程` }}</text>
    </view>
    <scroll-view :scroll-y="true" :style="`height: ${windowHeight - 80}px`" class="pop-content">
      <view class="form-container">
        <view class="label-item">
          <view class="label-text mb-10">日程类型 <text class="required">*</text></view>
          <u-radio-group v-if="props.modalType === ModalTypeEnum.ADD" v-model="formState.type">
            <u-radio
              :disabled="!actionConfigData.canAddLocationCalendar"
              :name="ScheduleTypeEnum.UNIT"
            >
              {{ ScheduleTypeTextEnum[ScheduleTypeEnum.UNIT] }}
            </u-radio>
            <u-radio :disabled="allowDept" :name="ScheduleTypeEnum.DEPARTMENT">
              {{ ScheduleTypeTextEnum[ScheduleTypeEnum.DEPARTMENT] }}
            </u-radio>
            <u-radio :name="ScheduleTypeEnum.PERSON">
              {{ ScheduleTypeTextEnum[ScheduleTypeEnum.PERSON] }}
            </u-radio>
          </u-radio-group>
          <text v-else class="edit-type-text">{{ ScheduleTypeTextEnum[formState.type] }}</text>
        </view>
        <view v-if="formState.type === 1 && props.sectionTypes.length > 1" class="label-item">
          <view class="label-text mb-10">所属学段 <text class="required">*</text></view>
          <u-radio-group v-model="formState.sectionType">
            <u-radio v-for="num in props.sectionTypes" :key="num" :name="num">{{
              SectionTypesEnum[num]
            }}</u-radio>
          </u-radio-group>
        </view>
        <view
          class="label-item"
          @click="
            () => {
              calendarDateShow = true;
            }
          "
        >
          <view class="label-text">事项时间 <text class="required">*</text></view>

          <view class="select-input">
            <text class="select-text">{{ formState.calendarDate }} </text>
            <u-icon name="arrow-right" color="#00000073" />
          </view>
        </view>
        <view class="label-item">
          <view class="label-text">起止时间</view>
          <view class="time-container">
            <view class="time-box">
              <view v-if="formState.startTime">
                <text
                  class="time-text"
                  @click="
                    () => {
                      calendarTimeStartShow = true;
                    }
                  "
                  >{{ formState.startTime }}</text
                >
                <u-icon
                  style="margin-left: 10rpx"
                  name="close-circle-fill"
                  size="32"
                  color="#00000043"
                  @click="formState.startTime = ''"
                />
              </view>

              <text
                v-else
                class="time-placeholder"
                @click="
                  () => {
                    calendarTimeStartShow = true;
                  }
                "
                >开始时间</text
              >
            </view>

            <text class="time-space">一</text>
            <view class="time-box">
              <view v-if="formState.endTime">
                <text class="time-text" @click="() => showEndTimePicker()">
                  {{ formState.endTime }}
                </text>
                <u-icon
                  style="margin-left: 10rpx"
                  name="close-circle-fill"
                  size="32"
                  color="#00000043"
                  @click="formState.endTime = ''"
                />
              </view>

              <text v-else class="time-placeholder" @click="() => showEndTimePicker()"
                >结束时间</text
              >
            </view>
          </view>
        </view>
        <view class="label-item">
          <view class="label-text">事项内容 <text class="required">*</text></view>

          <u-input
            v-model="formState.content"
            class="weekly-input"
            type="textarea"
            maxlength="256"
            clearable
            placeholder="请输入"
            placeholder-style="color: #00000073"
            :custom-style="{
              fontSize: '30rpx',
            }"
            :height="60"
            input-align="right"
            trim
            @blur="() => onBlur('事项内容')"
          ></u-input>
        </view>
        <view class="label-item">
          <view class="label-text">事项地点</view>
          <u-input
            v-model="formState.place"
            class="weekly-input"
            type="textarea"
            maxlength="256"
            clearable
            placeholder="请输入"
            placeholder-style="color: #00000073"
            :custom-style="{
              fontSize: '30rpx',
            }"
            :height="60"
            input-align="right"
            trim
          ></u-input>
        </view>
        <view
          v-if="
            formState.type === 2 &&
            actionConfigData.responsibleDepts &&
            actionConfigData.responsibleDepts.length > 1
          "
          class="label-item"
        >
          <view class="label-text">归属部门</view>
          <view
            class="select-input"
            @click="
              () => {
                belongDeptShow = true;
              }
            "
          >
            <text v-if="formState.belongDeptId">{{ formState.belongDeptName }} </text>
            <text v-else class="time-placeholder">请选择</text>
            <u-icon style="margin-left: 10rpx" name="arrow-right" color="#00000073"
          /></view>
        </view>
        <view v-if="formState.type !== 3" class="label-item">
          <view class="label-sub-item">
            <view class="label-sub-text">参加对象</view>
            <u-input
              v-model="formState.joinObjs"
              class="weekly-input"
              type="textarea"
              maxlength="500"
              clearable
              placeholder="请输入参加对象描述"
              placeholder-style="color: #00000073"
              :custom-style="{
                fontSize: '30rpx',
              }"
              :height="60"
              input-align="right"
              trim
            ></u-input>
            <!-- <u-input
              v-model="formState.joinObjs"
              type="text"
              placeholder="请输入参加对象描述"
              :maxlength="500"
              input-align="right"
            /> -->
          </view>
          <view class="label-sub-item">
            <view></view>
            <view class="select-input" @click="handleSelectPersons('joinUserIds')">
              <text
                v-if="
                  (formState.joinUserIds && formState.joinUserIds.length > 0) ||
                  (formState.joinUserIdsByDept && formState.joinUserIdsByDept.length > 0)
                "
                class="select-text"
                >{{ formState.joinUserIdsName }}
              </text>
              <text v-else class="time-placeholder">请选择参加对象</text>
              <u-icon style="margin-left: 10rpx" name="arrow-right" color="#00000073" />
            </view>
          </view>
        </view>
        <view v-if="formState.type === 1" class="label-item">
          <view class="label-text">负责部门 </view>
          <view class="select-input" @click="handleSelectLocations">
            <text
              v-if="formState.responsibleDeptIds && formState.responsibleDeptIds.length > 0"
              class="select-text"
              >{{ formState.responsibleDeptIdsName }}
            </text>
            <text v-else class="time-placeholder">请选择</text>
            <u-icon style="margin-left: 10rpx" name="arrow-right" color="#00000073"
          /></view>
        </view>
        <view
          v-if="formState.type !== 3"
          class="label-item"
          @click="handleSelectPersons('responsibleUserIds')"
        >
          <view class="label-text">负责人 </view>
          <view class="select-input">
            <text
              v-if="
                (formState.responsibleUserIds && formState.responsibleUserIds.length > 0) ||
                (formState.responsibleUserIdsByDept &&
                  formState.responsibleUserIdsByDept.length > 0)
              "
              class="select-text"
              >{{ formState.responsibleUserIdsName }}
            </text>
            <text v-else class="time-placeholder">请选择</text>
            <u-icon style="margin-left: 10rpx" name="arrow-right" color="#00000073"
          /></view>
        </view>
        <view
          v-if="props.modalType === ModalTypeEnum.EDIT && formState.repeatRuleIds[0] !== '-1'"
          class="label-item"
        >
          <view class="label-text">修改范围</view>
          <u-radio-group v-model="formState.updateType" @change="handleChangeUpDateType">
            <u-radio :name="2">修改所有重复日程</u-radio>
            <u-radio :name="1">仅修改本次日程</u-radio>
          </u-radio-group>
        </view>
        <view class="label-item">
          <view class="label-text">提醒 </view>
          <view class="select-input" @click="remindShow = true">
            <text v-if="formState.remindRuleId" class="select-text"
              >{{ formState.remindRuleIdName }}
            </text>
            <text v-else class="time-placeholder">请选择</text>
            <u-icon style="margin-left: 10rpx" name="arrow-right" color="#00000073"
          /></view>
        </view>
        <view class="label-item">
          <view class="label-text">重复 </view>
          <view
            class="select-input"
            @click="
              () => {
                if (formState.updateType !== 1) {
                  repeatShow = true;
                }
              }
            "
          >
            <text
              v-if="formState.repeatRuleIds && formState.repeatRuleIds[0] !== '-1'"
              class="select-text"
              :style="`${formState.updateType === 1 ? 'color: #999' : ''}`"
              >{{ formState.repeatRuleNames }}
            </text>
            <text v-else class="select-text">不重复</text>
            <u-icon style="margin-left: 10rpx" name="arrow-right" color="#00000073"
          /></view>
        </view>
        <view
          v-if="formState.repeatRuleIds[0] !== '-1'"
          class="label-item"
          @click="
            () => {
              if (formState.updateType !== 1) {
                repeatEndDateShow = true;
              }
            }
          "
        >
          <view class="label-text">结束于</view>
          <view class="select-input">
            <text class="select-text" :style="`${formState.updateType === 1 ? 'color: #999' : ''}`"
              >{{ formState.repeatEndDate }}
            </text>
            <u-icon name="arrow-right" color="#00000073" />
          </view>
        </view>
      </view>
      <view class="bottom-container" :style="`${calendarDateShow === true ? 'z-index: -1' : ''}`">
        <u-button type="primary" @click="doSubmit">确定</u-button>
      </view>
    </scroll-view>
  </u-popup>
  <u-calendar
    ref="repeatEndDateRef"
    v-model="repeatEndDateShow"
    mode="date"
    :min-date="minDate()"
    :max-date="maxDate()"
    @change="handRepeatEndDate"
  ></u-calendar>
  <u-picker
    v-model="calendarTimeStartShow"
    mode="time"
    :params="calendarTimeParams"
    @confirm="onTimeStartChange"
  ></u-picker>
  <u-picker
    v-model="calendarTimeEndShow"
    mode="time"
    :params="calendarTimeParams"
    @confirm="onTimeEndChange"
  ></u-picker>
  <u-toast ref="weeklyModalToast" />
  <u-calendar
    ref="calendarDateRef"
    v-model="calendarDateShow"
    mode="date"
    :min-date="minDate()"
    :max-date="maxDate()"
    @change="handCalendarDate"
  ></u-calendar>
  <u-select
    v-model="remindShow"
    mode="single-column"
    :list="formState.startTime ? actionConfigData.remindRules : remindRulesNoTime"
    value-name="id"
    label-name="name"
    @confirm="remindConfirm"
  ></u-select>
  <u-select
    v-model="belongDeptShow"
    mode="single-column"
    :list="actionConfigData.responsibleDepts"
    value-name="id"
    :default-value="[belongDeptIndex]"
    label-name="name"
    @confirm="handleBelongDeptIdChange"
  ></u-select>
  <dropMultipleSelect
    :is-show="repeatShow"
    :list="actionConfigData.repeatRules"
    :value="formState.repeatRuleIds"
    @close-event="repeatShow = false"
    @confirm-event="onRepeatRuleChange"
  />
  <dropMultiplePersonSelect
    :is-show="joinPersonSelectShow"
    :list="joinUserIdOptions"
    :value="formState.joinUserIdsByDept"
    @close-event="
      () => {
        joinPersonSelectShow = false;
      }
    "
    @confirm-event="onJoinUsersChange"
  />
  <dropMultiplePersonSelect
    :is-show="personSelectShow"
    :list="personIdOptions"
    :value="formState.responsibleUserIdsByDept"
    @close-event="
      () => {
        personSelectShow = false;
      }
    "
    @confirm-event="onPersonChange"
  />
</template>

<script lang="ts" setup>
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum, SelectorValue } from '@/components/selector/types';
import { cloneDeep } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { computed, onMounted, reactive, ref, watch, type PropType } from 'vue';
import dropMultiplePersonSelect from '../components/dropMultiplePersonSelect.vue';
import dropMultipleSelect from '../components/dropMultipleSelect.vue';
import {
  //   ModalTypeTips,
  ActionsConfigRspData,
  FormState,
  ModalTypeEnum,
  ScheduleTypeEnum,
  ScheduleTypeTextEnum,
  SectionTypesEnum,
  WeeklyCalendarsReq,
  WeeklyItem,
} from '../constants/index';
import {
  fetchActionsConfig,
  fetchAddWeeklyCalendars,
  fetchEditWeeklyCalendars,
  fetchTreeData,
} from '../services/index';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  // 添加 or 编辑
  modalType: {
    type: Number as PropType<ModalTypeEnum>,
    default: ModalTypeEnum.ADD,
  },
  // 学段
  sectionType: {
    type: Number,
    default: 1,
  },
  //学段选项
  sectionTypes: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
  locationId: {
    type: String,
    default: '',
  },
  addCalendarDate: {
    type: String,
    default: '',
  },
  editWeeklyItem: {
    type: Object as PropType<WeeklyItem>,
    default: () => {},
  },
  curCalendarEndDate: {
    type: String,
    default: '',
  },
  curCalendarStartDate: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['closeEvent', 'refresh', 'resetData']);
const weeklyModalToast = ref();
const calendarDateShow = ref(false);
const calendarTimeStartShow = ref(false);
const calendarTimeEndShow = ref(false);
const remindShow = ref(false);
const belongDeptShow = ref(false);
const belongDeptIndex = ref(0);
const repeatShow = ref(false);
const repeatEndDateShow = ref(false);
const personSelectShow = ref(false);
const joinPersonSelectShow = ref(false);
const calendarTimeParams = {
  hour: true,
  minute: true,
};

const { windowHeight } = uni.getSystemInfoSync();

const modalOpen = computed(() => props.visible);
let formState: FormState = reactive({
  type: 1,
  calendarDate: dayjs(new Date()).format('YYYY-MM-DD'),
  content: '',
  place: '',
  joinObjs: '',
  joinUserIds: undefined,
  joinUserIdsName: '',
  responsibleDeptIds: undefined,
  responsibleUserIds: undefined,
  responsibleUserIdsName: '',
  joinUserIdsByDept: undefined,
  responsibleUserIdsByDept: undefined,
  remindRuleId: '-1',
  repeatEndDate: '',
  repeatRuleIds: ['-1'],
  belongDeptId: undefined,
  belongDeptName: '',
  startTime: '',
  endTime: '',
  sectionType: 1,
  id: 0,
  updateType: 2,
  responsibleDeptIdsName: '',
  remindRuleIdName: '不提醒',
  repeatRuleNames: '不重复',
});
const actionConfigData = ref<ActionsConfigRspData>({
  canAddLocationCalendar: 0,
  remindRules: [],
  repeatRules: [],
  responsibleDepts: [],
});
const allowDept = ref<boolean>(false);
const personIdOptions = ref<any>([]);
const joinUserIdOptions = ref<any>([]);
const remindRulesNoTime = ref([{ id: '-1', name: '不提醒' }]);

const repeatEndDateRef = ref();
const calendarDateRef = ref();

function close() {
  resetModalData();
  emit('closeEvent');
  emit('resetData');
}
// 获取周行事历配置
const getActionsConfig = async () => {
  actionConfigData.value = await fetchActionsConfig();
  allowDept.value = actionConfigData.value.responsibleDepts.length > 0 ? false : true;
  // 设置初始日程类型
  if (actionConfigData.value.canAddLocationCalendar) {
    formState.type = 1;
  } else if (!allowDept.value) {
    formState.type = 2;
  } else {
    formState.type = 3;
  }
  formState.belongDeptId = actionConfigData.value.responsibleDepts[0].id;
  formState.belongDeptName = actionConfigData.value.responsibleDepts[0].name;
  getPersonDataTree();
  actionConfigData.value.remindRules = [{ id: '-1', name: '不提醒' }].concat(
    actionConfigData.value.remindRules,
  );
  (remindRulesNoTime.value = [{ id: '-1', name: '不提醒' }].concat([
    actionConfigData.value.remindRules[actionConfigData.value.remindRules.length - 1],
  ])),
    (actionConfigData.value.repeatRules = [{ id: '-1', name: '不重复' }].concat(
      actionConfigData.value.repeatRules,
    ));
  console.log('=== actionsConfig', actionConfigData.value);
};
const getPersonDataTree = async () => {
  const data = await fetchTreeData([formState.belongDeptId]);
  personIdOptions.value = cloneDeep(data);
  joinUserIdOptions.value = cloneDeep(data);
};
const initModal = () => {
  getActionsConfig();
  setCalendarDefaultActiveDate(calendarDateRef.value, formState.calendarDate);
};
const handCalendarDate = (val: any) => {
  formState.calendarDate = val.result;
};

// 填充编辑表单内容
const handleSetEditWeeklyData = (data: WeeklyItem) => {
  console.log('===watch EditWeeklyData', data);
  if (!data) return;
  formState.calendarDate = data.calendarDate;
  setCalendarDefaultActiveDate(calendarDateRef.value, formState.calendarDate);
  formState.content = data.content;
  formState.type = data.contentType;
  formState.id = data.id;
  if (data.place) {
    formState.place = data.place;
  }
  if (data.startTime) {
    formState.startTime = data.startTime;
  }
  if (data.endTime) {
    formState.endTime = data.endTime;
  }

  if (data.joinObjs) {
    formState.joinObjs = data.joinObjs;
  }
  if (data.joinUserIds) {
    //  判断是单位还是部门
    if (data.contentType === 1) {
      formState.joinUserIds = data.joinUserIds;
      formState.joinUserIdsName = data.joinUsers;
    } else {
      // 过滤离职或者已经不在组织部门的人员
      const filterJoins = filterOutPerson(data.joinUserIds, personIdOptions.value);
      formState.joinUserIdsByDept = filterJoins;
      formState.joinUserIdsName = data.joinUsers;
    }
  }

  if (data.responsibleDeptIds) {
    formState.responsibleDeptIds = data.responsibleDeptIds;
    formState.responsibleDeptIdsName = data.responsibleDepts;
  }
  if (data.responsibleUserIds) {
    //  判断是单位还是部门
    if (data.contentType === 1) {
      formState.responsibleUserIds = data.responsibleUserIds;
    } else {
      formState.responsibleUserIdsByDept = data.responsibleUserIds;
    }
    formState.responsibleUserIdsName = data.responsibleUsers;
  }
  if (data.belongDeptId) {
    formState.belongDeptId = data.belongDeptId;
    const index = actionConfigData.value.responsibleDepts.findIndex(
      item => item.id === data.belongDeptId,
    );
    if (index !== -1) {
      belongDeptIndex.value = index;
      formState.belongDeptName = actionConfigData.value.responsibleDepts[index].name;
    }
    getPersonDataTree();
  }
  //提醒
  if (data.remindRuleId) {
    formState.remindRuleId = data.remindRuleId;
    formState.remindRuleIdName = getEditRemindName(formState.remindRuleId);
  }
  // 重复
  if (data.repeatRuleIds && data.repeatRuleIds.length > 0) {
    formState.repeatRuleIds = data.repeatRuleIds;
    formState.repeatRuleNames = getEditRepeatName(formState.repeatRuleIds);
  }
  // 结束于
  if (data.repeatEndDate) {
    formState.repeatEndDate = data.repeatEndDate;
    setCalendarDefaultActiveDate(repeatEndDateRef.value, formState.repeatEndDate);
  }
};
const getEditRepeatName = (repeatIds: (string | number)[]) => {
  const arr: string[] = [];
  repeatIds.forEach(ele => {
    const item = actionConfigData.value.repeatRules.find(item => item.id === ele);
    if (item) {
      arr.push(item.name);
    }
  });
  return arr.join('、');
};
const getEditRemindName = (remindId: string | number) => {
  const item = actionConfigData.value.remindRules.find(item => item.id === remindId);
  if (item) {
    return item.name;
  }
  return '';
};
function filterOutPerson(target: any, source: any) {
  if (target && target.length > 0) {
    const filterArr: any = [];
    target.forEach((element: any) => {
      const item = source.find((item: any) => {
        return element === item.id;
      });
      filterArr.push(item.id);
    });
    return filterArr;
  }
}
// 重置表单数据
const resetModalData = () => {
  Object.assign(formState, {
    sectionType: props.sectionType,
    content: '',
    place: '',
    joinObjs: '',
    joinUserIds: undefined,
    joinUserIdsByDept: undefined,
    responsibleDeptIds: undefined,
    responsibleUserIds: undefined,
    responsibleUserIdsByDept: undefined,
    remindRuleId: '-1',
    repeatEndDate: '',
    repeatRuleIds: ['-1'],
    id: 0,
    updateType: 2,
    calendarDate: '',
    startTime: '',
    endTime: '',
    joinUserIdsName: '',
    responsibleUserIdsName: '',
  });
  console.log('==formState', formState);
};

const handleBelongDeptIdChange = (val: any) => {
  const selectVal = val[0];
  formState.belongDeptId = selectVal.value;
  formState.belongDeptName = selectVal.label;
  getPersonDataTree();
  formState.joinUserIdsByDept = undefined;
  formState.responsibleUserIdsByDept = undefined;
  belongDeptIndex.value = selectVal.index;
};

const validateForm = () => {
  if (!formState.content) {
    onBlur('事项内容');
    return false;
  }

  const [endHour, endMin] = formState.endTime.split(':');
  const [startHour, startMin] = formState.startTime.split(':');

  if (endHour && !startHour) {
    weeklyModalToast.value.show({
      title: '若结束时间不为空则开始时间不能为空',
      type: 'default',
    });
    return false;
  }
  if (endHour && (endHour < startHour || (endHour === startHour && endMin <= startMin))) {
    weeklyModalToast.value.show({
      title: '结束时间必须大于开始时间',
      type: 'default',
    });
    return false;
  }
  return true;
};
// 提交
const doSubmit = () => {
  if (!validateForm()) return;
  const calendarData: WeeklyCalendarsReq = {
    content: formState.content, //事项内容
    calendarDate: formState.calendarDate, //事项日期
    type: formState.type, // 日程类型
    place: formState.place, //地点，必填
    startTime: formState.startTime,
    endTime: formState.endTime,
  };
  // 仅单位日程需要补充学段字段
  if (formState.type === 1) {
    calendarData.sectionType = formState.sectionType;
  }
  // 归属部门
  if (formState.belongDeptId && formState.type === 2) {
    calendarData.belongDeptId = formState.belongDeptId;
  }
  // 参与对象相关
  if (formState.type !== 3) {
    calendarData.joinObjs = formState.joinObjs; //参与对象描述
    calendarData.joinUserIds =
      formState.type === 1 ? formState.joinUserIds : formState.joinUserIdsByDept; // 参与对象id数组
  }
  // 负责部门
  if (
    formState.responsibleDeptIds &&
    formState.responsibleDeptIds.length > 0 &&
    formState.type !== 3
  ) {
    calendarData.responsibleDeptIds = formState.responsibleDeptIds;
  }
  // 负责人
  if (formState.type !== 3) {
    calendarData.responsibleUserIds =
      formState.type === 1 ? formState.responsibleUserIds : formState.responsibleUserIdsByDept;
  }

  // 提醒逻辑
  if (formState.remindRuleId !== '-1') {
    calendarData.remindRuleId = formState.remindRuleId;
  } else {
    delete calendarData.remindRuleId;
  }
  // 重复逻辑
  if (formState.repeatRuleIds[0] !== '-1' && formState.updateType !== 1) {
    calendarData.repeatRuleIds = formState.repeatRuleIds;
  } else {
    calendarData.repeatRuleIds = [];
  }
  if (
    formState.repeatRuleIds[0] !== '-1' &&
    formState.repeatRuleIds.length > 0 &&
    formState.repeatEndDate &&
    formState.updateType !== 1
  ) {
    calendarData.repeatEndDate = dayjs(formState.repeatEndDate).format('YYYY-MM-DD');
  }
  console.log('=== formState', calendarData);
  if (props.modalType === ModalTypeEnum.ADD) {
    //添加日程
    fetchAddWeeklyCalendars(calendarData)
      .then((res: any) => {
        //添加日程成功
        console.log('===add', res);
        weeklyModalToast.value.show({
          title: '添加成功',
          type: 'default',
        });
        emit('refresh');
        close();
      })
      .catch(res => {
        weeklyModalToast.value.show({
          title: res.desc || '网络异常，稍后再试',
          type: 'default',
        });
      });
  } else {
    //编辑日程
    if (formState.id) {
      calendarData.id = formState.id;
    }
    // 修改时 是否修改周期性
    console.log('===formState.repeatRuleIds', formState.repeatRuleIds);
    if (
      (props.editWeeklyItem.repeatRuleIds.length > 0 || formState.repeatRuleIds[0] !== '-1') &&
      formState.updateType === 2
    ) {
      calendarData.updateType = formState.updateType;
    } else {
      calendarData.updateType = 1;
    }
    fetchEditWeeklyCalendars(calendarData)
      .then(() => {
        weeklyModalToast.value.show({
          title: '修改成功',
          type: 'default',
        });
        emit('refresh');
        close();
      })
      .catch(res => {
        weeklyModalToast.value.show({
          title: res.desc || '网络异常，稍后再试',
          type: 'default',
        });
      });
  }
};

// 事项日期时间
const minDate = () => {
  const currentDate = dayjs(new Date().setHours(0, 0, 0, 0));
  const startDate = dayjs(props.curCalendarStartDate);
  return currentDate.isAfter(startDate)
    ? currentDate.format('YYYY-MM-DD')
    : startDate.format('YYYY-MM-DD');
};
const maxDate = () => {
  const nowDay = dayjs();
  const startDate = dayjs(props.curCalendarStartDate);
  const beginDay = nowDay.isAfter(startDate) ? nowDay : startDate;
  const day180 = dayjs(beginDay).add(180, 'day');
  const endDate = dayjs(props.curCalendarEndDate);
  return endDate.isAfter(day180) ? day180.format('YYYY-MM-DD') : endDate.format('YYYY-MM-DD');
};
const showEndTimePicker = () => {
  if (formState.startTime) {
    calendarTimeEndShow.value = true;
  } else {
    weeklyModalToast.value.show({
      title: '请先选择开始时间',
      type: 'default',
    });
  }
};
const onTimeStartChange = (val: any) => {
  const startHour = val.hour;
  const startMin = val.minute;
  const [endHour, endMin] = formState.endTime.split(':');
  if (endHour && (endHour < startHour || (endHour === startHour && endMin <= startMin))) {
    weeklyModalToast.value.show({
      title: '结束时间必须大于开始时间',
      type: 'default',
    });
  }
  formState.startTime = `${val.hour}:${val.minute}`;
};
const onTimeEndChange = (val: any) => {
  const endHour = val.hour;
  const endMin = val.minute;
  const [startHour, startMin] = formState.startTime.split(':');
  if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
    weeklyModalToast.value.show({
      title: '结束时间必须大于开始时间',
      type: 'default',
    });
  } else {
    formState.endTime = `${val.hour}:${val.minute}`;
  }
};
const onBlur = (str: string) => {
  if (!formState.content) {
    weeklyModalToast.value.show({
      title: `${str}不能为空`,
      type: 'default',
    });
  }
};
type FormKey = 'joinUserIds' | 'responsibleUserIds';
const handleSelectPersons = (key: FormKey) => {
  if (formState.type === 1) {
    showSelector({
      type: SelectorTypeEnum.person,
      multiple: true,
      value: formState[key],
      callback: (value, data) => {
        formState[key] = value;
        formState[`${key}Name`] = (data as SelectorValue[])?.map(i => i.name).join('、');
      },
    });
  } else {
    if (key === 'joinUserIds') {
      joinPersonSelectShow.value = true;
    } else {
      personSelectShow.value = true;
    }
  }
};

const handleSelectLocations = () => {
  showSelector({
    type: SelectorTypeEnum.department,
    multiple: true,
    value: formState.responsibleDeptIds,
    callback: (value, data) => {
      formState.responsibleDeptIds = value;
      formState.responsibleDeptIdsName = (data as SelectorValue[])?.map(i => i.name).join('、');
    },
  });
};
const remindConfirm = (val: any) => {
  const selectValue = val[0];
  formState.remindRuleId = selectValue.value;
  formState.remindRuleIdName = selectValue.label;
};

const onRepeatRuleChange = (val: any) => {
  formState.repeatRuleIds = val.value;
  formState.repeatRuleNames = val.list.map((i: any) => i.name).join('、');
  console.log('===onRepeatRuleChange', formState.repeatRuleIds, formState.repeatRuleNames);
  if (!props.editWeeklyItem || !props.editWeeklyItem.repeatEndDate) {
    setDefaultRepeatEndTime();
  }
};

const onJoinUsersChange = (val: any) => {
  formState.joinUserIdsByDept = val.value;
  formState.joinUserIdsName = val.list.map((i: any) => i.name).join('、');
};
const onPersonChange = (val: any) => {
  formState.responsibleUserIdsByDept = val.value;
  formState.responsibleUserIdsName = val.list.map((i: any) => i.name).join('、');
};

// 设置默认重复结束时间
const setDefaultRepeatEndTime = () => {
  const date7After = formState.calendarDate
    ? dayjs(formState.calendarDate).add(7, 'day')
    : dayjs().add(7, 'day');
  const calendarEndData = dayjs(props.curCalendarEndDate).add(1, 'day');
  formState.repeatEndDate = dayjs(
    date7After.isBefore(calendarEndData) ? date7After : calendarEndData,
  ).format('YYYY-MM-DD');
  setCalendarDefaultActiveDate(repeatEndDateRef.value, formState.repeatEndDate);
};
const handRepeatEndDate = (val: any) => {
  formState.repeatEndDate = val.result;
};
const handleChangeUpDateType = () => {
  console.log('===', formState);
  if (formState.updateType === 1) {
    formState.repeatRuleIds = props.editWeeklyItem.repeatRuleIds;
    formState.repeatRuleNames = getEditRepeatName(formState.repeatRuleIds);
    formState.repeatEndDate = props.editWeeklyItem.repeatEndDate;
  }
};

//设置u-calendar 默认时间 activeDate
const setCalendarDefaultActiveDate = (target: any, date: string) => {
  const targetDate = dayjs(date).format('YYYY-M-D');
  const [year, month, day] = targetDate.split('-');
  target.activeDate = targetDate;
  target.year = Number(year);
  target.month = Number(month);
  target.day = Number(day);
  target.changeData();
};
onMounted(() => {
  initModal();
});
// 监听学段变化
watch(
  () => props.sectionType,
  newProps => {
    formState.sectionType = newProps;
  },
);
// 编辑模式
watch(
  () => props.editWeeklyItem,
  newProps => {
    handleSetEditWeeklyData(newProps);
  },
);
// //卡片&列表添加模式 带日期
watch(
  () => props.addCalendarDate,
  newProps => {
    formState.calendarDate = newProps;
    initModal();
  },
);
</script>
<style lang="scss" scoped>
.container {
}
.form-container {
  padding: 0 32rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
}
.label-item {
  display: flex;
  padding: 26rpx 0;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 2rpx solid #0000000f;
}
.label-sub-item {
  display: flex;
  width: 100%;
  margin-bottom: 10rpx;
  justify-content: space-between;
}
.label-text {
  display: flex;
  align-items: center;
  color: #000000e0;
  font-size: 32rpx;
  margin-right: 32rpx;
  &.mb-10 {
    margin-bottom: 16rpx;
  }
  .required {
    color: #ff4d4f;
    margin-left: 8rpx;
  }
}
.label-sub-text {
  display: flex;
  align-items: center;
  color: #000000e0;
  font-size: 32rpx;
  margin-right: 32rpx;
}
.time-text {
  color: #000000e0;
  font-size: 32rpx;
}
.time-space {
  color: #000000e0;
  font-size: 32rpx;
  padding: 0 48rpx;
}
.time-placeholder {
  color: #00000073;
  font-size: 32rpx;
}
.time-container {
  display: flex;
  justify-content: space-around;
}
.bottom-container {
  position: relative;
  width: 100%;
  background-color: #fff;
  padding: 24rpx 32rpx 100rpx;
}
.select-input {
  display: flex;
  align-items: center;
  max-width: 460rpx;
  height: 44rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-text {
  color: #000000e0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 32rpx;
}
.pop-content {
  width: 100%;
}
.title-container {
  position: reactive;
  display: flex;
  height: 112rpx;
  justify-content: center;
  align-items: center;
  border-bottom: 2rpx solid #0000000f;
  text {
    font-size: 34rpx;
    font-weight: 500;
    color: #000000e0;
  }
}
.title-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-type-text {
  color: #00000040;
  font-size: 32rpx;
}
.weekly-input {
  width: 440rpx;
}
</style>
