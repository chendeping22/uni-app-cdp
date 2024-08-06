<template>
  <view>
    <view class="h-100 bg-white shadow-search">
      <view class="flex-center ptb-s plr-l">
        <u-search
          v-model="keyword"
          bg-type="fill-default"
          border-color-type="fill-default"
          class="flex-stretch"
          shape="square"
          :focus="false"
          :show-action="false"
          placeholder="搜索科目/老师"
          @change="handleNameChange"
          @clear="keyword = ''"
        />
        <view
          class="flex-center no-shrink ml-l h-68 w-68 radius-default border-solid border-line-default border-thick"
          @click="handleShowMore"
        >
          <image class="h-40 w-40" :src="filterActive ? IconFilterActive : IconFilter" />
        </view>
      </view>
    </view>
    <view class="w100 h-112 scroll-x">
      <view class="plr-l ptb-b flex-center flex-left" style="width: 970rpx">
        <view
          v-for="(item, index) in statusList"
          :key="item.value"
          class="status-item no-shrink"
          :style="{
            marginLeft: index > 0 ? '16rpx' : '0',
          }"
          :class="item.value === status ? 'active' : ''"
          @click="handleStatusChange(item)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>
  </view>
  <view v-if="showMore" class="fill-more-popup">
    <view class="fill-more-bg" @click="handleCloseMore"></view>
    <view
      class="bg-white fill-more-wrapper border-top border-line-light border-thick radius-default radius-bottom"
    >
      <view class="plr-l">
        <view class="pt-l pb-b bold color-base" style="font-size: 30rpx">申请类型</view>
        <view class="flex-center pb-l">
          <view
            class="flex-center h-80 font-title radius-small"
            :class="type === '' ? 'bg-primary-light-3 color-primary' : 'bg-fill-default'"
            style="flex: 1"
            @click="handleTypeChange('')"
          >
            全部
          </view>
          <view
            class="flex-center h-80 font-title radius-small ml-b"
            :class="type === '1' ? 'bg-primary-light-3 color-primary' : 'bg-fill-default'"
            style="flex: 1"
            @click="handleTypeChange('1')"
          >
            调课申请
          </view>
          <view
            class="flex-center h-80 font-title radius-small ml-b"
            :class="type === '2' ? 'bg-primary-light-3 color-primary' : 'bg-fill-default'"
            style="flex: 1"
            @click="handleTypeChange('2')"
          >
            代课申请
          </view>
        </view>
        <view class="pt-l pb-b bold color-base" style="font-size: 30rpx">时间筛选</view>
        <view class="flex-center pb-b">
          <view
            class="flex-center h-80 font-title radius-small"
            :class="timeType === 'day' ? 'bg-primary-light-3 color-primary' : 'bg-fill-default'"
            style="flex: 1"
            @click="handleTimeTypeChange('day')"
          >
            日
          </view>
          <view
            class="flex-center h-80 font-title radius-small ml-b"
            :class="timeType === 'month' ? 'bg-primary-light-3 color-primary' : 'bg-fill-default'"
            style="flex: 1"
            @click="handleTimeTypeChange('month')"
          >
            月
          </view>
          <view
            class="flex-center h-80 font-title radius-small ml-b"
            :class="timeType === 'year' ? 'bg-primary-light-3 color-primary' : 'bg-fill-default'"
            style="flex: 1"
            @click="handleTimeTypeChange('year')"
          >
            年
          </view>
        </view>
        <view v-if="timeType" class="pb-b">
          <view v-if="timeType === 'day'" class="flex-center">
            <view
              class="flex-center h-76 border-thick border-solid time-border radius-default"
              style="flex: 1"
            >
              <picker
                class="h-76 w100"
                mode="date"
                fields="day"
                :value="selectedStartDate"
                :end="selectedEndDate"
                @change="handleDateStartChange"
              >
                <view class="h-76 w100 weight-500 font-title color-time flex-center">
                  {{
                    selectedStartDate
                      ? dayjs(selectedStartDate).format('YYYY年MM月DD日')
                      : '开始时间'
                  }}
                </view>
              </picker>
            </view>
            <view class="plr-b font-title">-</view>
            <view
              class="flex-center h-76 border-thick border-solid time-border radius-default"
              style="flex: 1"
            >
              <picker
                class="h-76 w100"
                mode="date"
                fields="day"
                :value="selectedEndDate"
                :start="selectedStartDate"
                @change="handleDateEndChange"
              >
                <view class="h-76 w100 weight-500 font-title color-time flex-center">
                  {{
                    selectedEndDate ? dayjs(selectedEndDate).format('YYYY年MM月DD日') : '结束时间'
                  }}
                </view>
              </picker>
            </view>
          </view>
          <view v-if="timeType === 'month'" class="flex-center">
            <view
              class="flex-center h-76 border-thick border-solid time-border radius-default"
              style="flex: 1"
            >
              <picker
                class="h-76 w100"
                mode="date"
                fields="month"
                :value="selectedStartMonth"
                :end="selectedEndMonth"
                @change="handleMonthStartChange"
              >
                <view class="h-76 w100 weight-500 font-title color-time flex-center">
                  {{
                    selectedStartMonth ? dayjs(selectedStartMonth).format('YYYY年MM月') : '开始时间'
                  }}
                </view>
              </picker>
            </view>
            <view class="plr-b font-title">-</view>
            <view
              class="flex-center h-76 border-thick border-solid time-border radius-default"
              style="flex: 1"
            >
              <picker
                class="h-76 w100"
                mode="date"
                fields="month"
                :value="selectedEndMonth"
                :start="selectedStartMonth"
                @change="handleMonthEndChange"
              >
                <view class="h-76 w100 weight-500 font-title color-time flex-center">
                  {{ selectedEndMonth ? dayjs(selectedEndMonth).format('YYYY年MM月') : '结束时间' }}
                </view>
              </picker>
            </view>
          </view>
          <view v-if="timeType === 'year'" class="flex-center">
            <view
              class="flex-center h-76 border-thick border-solid time-border radius-default"
              style="flex: 1"
            >
              <picker
                class="h-76 w100"
                mode="date"
                fields="year"
                :value="selectedStartYear"
                :end="selectedEndYear"
                @change="handleYearStartChange"
              >
                <view class="h-76 w100 weight-500 font-title color-time flex-center">
                  {{ selectedStartYear ? dayjs(selectedStartYear).format('YYYY年') : '开始时间' }}
                </view>
              </picker>
            </view>
            <view class="plr-b font-title">-</view>
            <view
              class="flex-center h-76 border-thick border-solid time-border radius-default"
              style="flex: 1"
            >
              <picker
                class="h-76 w100"
                mode="date"
                fields="year"
                :value="selectedEndYear"
                :start="selectedStartYear"
                @change="handleYearEndChange"
              >
                <view class="h-76 w100 weight-500 font-title color-time flex-center">
                  {{ selectedEndYear ? dayjs(selectedEndYear).format('YYYY年') : '结束时间' }}
                </view>
              </picker>
            </view>
          </view>
        </view>
      </view>
      <view class="border-top border-line-light border-thick">
        <view class="flex-center plr-l ptb-b">
          <view
            class="flex-center bold font-title color-primary h-76 border-thick border-solid border-primary radius-default"
            style="flex: 1"
            @click="handleReset"
          >
            重置
          </view>
          <view
            class="flex-center bold bg-primary font-title color-white h-76 border-thick border-solid border-primary radius-default ml-b"
            style="flex: 1"
            @click="handleConfirm"
          >
            确定
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import IconFilterActive from '../../static/course-info/filter-active.svg';
import IconFilter from '../../static/course-info/filter.svg';

const props = defineProps<{
  value?: any;
}>();

const emits = defineEmits(['change']);
const keyword = ref('');
const status = ref('');
const statusList = [
  { label: '全部', value: '' },
  { label: '待处理', value: '0' },
  { label: '已同意', value: '1' },
  { label: '已拒绝', value: '2' },
  { label: '已撤销', value: '3' },
  { label: '已失效', value: '4' },
];
const type = ref<string>(''); // '1' - 调课 | '2' - 代课
const timeType = ref('day'); // 'day' | 'month' | 'year'
const selectedStartDate = ref('');
const selectedEndDate = ref('');
const selectedStartMonth = ref('');
const selectedEndMonth = ref('');
const selectedStartYear = ref('');
const selectedEndYear = ref('');
const showMore = ref(false);

const filterActive = computed(() => {
  if (props.value?.type) {
    return true;
  }
  if (props.value?.timeType === 'day') {
    if (props.value?.startTime || props.value?.endTime) {
      return true;
    }
  } else if (props.value?.timeType === 'month') {
    if (props.value?.startTime || props.value?.endTime) {
      return true;
    }
  } else if (props.value?.timeType === 'year') {
    if (props.value?.startTime || props.value?.endTime) {
      return true;
    }
  }
  return false;
});

watch(
  () => props.value,
  newVal => {
    console.log('props.value change', newVal);
    if (newVal?.keyword) {
      keyword.value = newVal?.keyword;
    }
    if (newVal?.status) {
      status.value = newVal?.status;
    } else {
      status.value = '';
    }
    if (newVal?.type) {
      type.value = newVal?.type;
    } else {
      type.value = '';
    }

    if (newVal?.timeType === 'day') {
      timeType.value = 'day';
      if (newVal?.startTime) {
        selectedStartDate.value = dayjs(newVal?.startTime).format('YYYY-MM-DD');
      }
      if (newVal?.endTime) {
        selectedEndDate.value = dayjs(newVal?.endTime).format('YYYY-MM-DD');
      }
    } else if (newVal?.timeType === 'month') {
      timeType.value = 'month';
      if (newVal?.startTime) {
        selectedStartMonth.value = dayjs(newVal?.startTime).format('YYYY-MM');
      }
      if (newVal?.endTime) {
        selectedEndMonth.value = dayjs(newVal?.endTime).format('YYYY-MM');
      }
    } else if (newVal?.timeType === 'year') {
      timeType.value = 'year';
      if (newVal?.startTime) {
        selectedStartYear.value = dayjs(newVal?.startTime).format('YYYY');
      }
      if (newVal?.endTime) {
        selectedEndYear.value = dayjs(newVal?.endTime).format('YYYY');
      }
    } else {
      timeType.value = 'day';
    }
  },
);

onBeforeMount(() => {
  const params = getParams();
  emits('change', params);
  uni.$on('CLOSE_ADJUST_APPLY_SEARCH_MORE', handleCloseMore);
});

onBeforeUnmount(() => {
  uni.$off('CLOSE_ADJUST_APPLY_SEARCH_MORE', handleCloseMore);
});

function getParams() {
  const data: any = {};
  if (keyword.value) {
    data.keyword = keyword.value;
  }
  if (status.value) {
    data.status = status.value;
  }
  if (type.value) {
    data.type = type.value;
  }
  data.timeType = timeType.value;
  if (data.timeType === 'day') {
    if (selectedStartDate.value) {
      data.startTime = dayjs(selectedStartDate.value).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    }
    if (selectedEndDate.value) {
      data.endTime = dayjs(selectedEndDate.value).endOf('day').format('YYYY-MM-DD HH:mm:ss');
    }
  }
  if (data.timeType === 'month') {
    if (selectedStartMonth.value) {
      data.startTime = dayjs(selectedStartMonth.value)
        .startOf('month')
        .format('YYYY-MM-DD HH:mm:ss');
    }
    if (selectedEndMonth.value) {
      data.endTime = dayjs(selectedEndMonth.value).endOf('month').format('YYYY-MM-DD HH:mm:ss');
    }
  }
  if (data.timeType === 'year') {
    if (selectedStartYear.value) {
      data.startTime = dayjs(selectedStartYear.value).startOf('year').format('YYYY-MM-DD HH:mm:ss');
    }
    if (selectedEndYear.value) {
      data.endTime = dayjs(selectedEndYear.value).endOf('year').format('YYYY-MM-DD HH:mm:ss');
    }
  }
  return data;
}

function handleNameChange(v: any) {
  keyword.value = v;
  const params = getParams();
  emits('change', params);
}
function handleStatusChange(statusItem: any) {
  status.value = statusItem.value;
  const params = getParams();
  emits('change', params);
}
function handleShowMore() {
  if (showMore.value) {
    showMore.value = false;
  } else {
    // 浮窗的筛选条件初始化为当前生效值
    const newVal = props.value;
    if (newVal?.type) {
      type.value = newVal?.type;
    } else {
      type.value = '';
    }

    selectedStartDate.value = '';
    selectedEndDate.value = '';
    selectedStartMonth.value = '';
    selectedEndMonth.value = '';
    selectedStartYear.value = '';
    selectedEndYear.value = '';
    if (newVal?.timeType === 'day') {
      timeType.value = 'day';
      if (newVal?.startTime) {
        selectedStartDate.value = dayjs(newVal?.startTime).format('YYYY-MM-DD');
      }
      if (newVal?.endTime) {
        selectedEndDate.value = dayjs(newVal?.endTime).format('YYYY-MM-DD');
      }
    } else if (newVal?.timeType === 'month') {
      timeType.value = 'month';
      if (newVal?.startTime) {
        selectedStartMonth.value = dayjs(newVal?.startTime).format('YYYY-MM');
      }
      if (newVal?.endTime) {
        selectedEndMonth.value = dayjs(newVal?.endTime).format('YYYY-MM');
      }
    } else if (newVal?.timeType === 'year') {
      timeType.value = 'year';
      if (newVal?.startTime) {
        selectedStartYear.value = dayjs(newVal?.startTime).format('YYYY');
      }
      if (newVal?.endTime) {
        selectedEndYear.value = dayjs(newVal?.endTime).format('YYYY');
      }
    } else {
      timeType.value = 'day';
    }

    showMore.value = true;
  }
}
function handleCloseMore() {
  showMore.value = false;
}
function handleTypeChange(_type: string) {
  type.value = _type;
}
function handleTimeTypeChange(_timeType: string) {
  if (timeType.value !== _timeType) {
    timeType.value = _timeType;
  }
}
function handleDateStartChange(params: any) {
  selectedStartDate.value = params.detail.value;
}
function handleDateEndChange(params: any) {
  selectedEndDate.value = params.detail.value;
}
function handleMonthStartChange(params: any) {
  selectedStartMonth.value = params.detail.value;
}
function handleMonthEndChange(params: any) {
  selectedEndMonth.value = params.detail.value;
}
function handleYearStartChange(params: any) {
  selectedStartYear.value = params.detail.value;
}
function handleYearEndChange(params: any) {
  selectedEndYear.value = params.detail.value;
}
function handleReset() {
  const isChanged = filterActive.value;
  type.value = '';
  timeType.value = 'day';
  selectedStartDate.value = '';
  selectedEndDate.value = '';
  selectedStartMonth.value = '';
  selectedEndMonth.value = '';
  selectedStartYear.value = '';
  selectedEndYear.value = '';
  if (isChanged) {
    const params = getParams();
    emits('change', params);
  }
  showMore.value = false;
}
function handleConfirm() {
  const params = getParams();
  emits('change', params);
  showMore.value = false;
}
</script>
<style lang="scss" scoped>
@-webkit-keyframes fadeIn {
  0% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
@-webkit-keyframes fadeInDown {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
@keyframes fadeInDown {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
.search-input {
  background-color: #f0f0f0;
}
.fill-more-popup {
  position: fixed;
  // #ifdef H5
  top: calc(env(safe-area-inset-top) + 45px + 180rpx);
  // #endif
  // #ifdef MP-WEIXIN || APP-PLUS
  top: 181rpx;
  // #endif
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  overflow: hidden;

  .fill-more-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    transition: all 5s ease-in-out;
    animation: fadeIn 0.2s ease-in-out 1 forwards;
  }
  .fill-more-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    animation: fadeInDown 0.2s ease-in-out 1 forwards;
  }
  .fill-more-container {
    padding: 24rpx 32rpx;
  }
}
.weight-500 {
  font-weight: 500;
}
.color-time {
  color: rgba(0, 0, 0, 0.65);
}
.time-border {
  border-color: $color-border;
}
.shadow-search {
  box-shadow: 0 4px 5px 0 rgb(24 25 68 / 5%);
}
.status-item {
  border-radius: 32rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  background-color: rgba(0, 0, 0, 0.06);
  &.active {
    background-color: rgba(22, 119, 255, 1);
    color: #ffffff;
  }
}
</style>
