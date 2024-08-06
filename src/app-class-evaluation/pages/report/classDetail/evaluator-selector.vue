<template>
  <slot name="trigger" :open="open">
    <view class="list-filter-item" @click="open">
      {{ state.label
      }}<u-image
        class="list-filter-item-down"
        width="32rpx"
        height="32rpx"
        :src="arrow_down_filed"
      ></u-image>
    </view>
  </slot>
  <u-popup
    class="evaluator-popup"
    v-model="show"
    mode="bottom"
    safe-area-inset-bottom
    height="80%"
    @close="close"
    :border-radius="16"
  >
    <view class="evaluator-popup-header">
      <view class="evaluator-popup-cancel" @click="reset">取消</view>
      <view class="evaluator-popup-title">评价人选择</view>
      <view class="evaluator-popup-sure" @click="confirm">确定</view>
    </view>
    <view class="evaluator-popup-content">
      <template v-if="state.studentVOS.length || state.teacherVOS.length">
        <view class="all-selected" @click="onAllSelected">
          <circle-checkbox
            class="grade-item-checkbox"
            @click="onAllSelected"
            :selected="allSelected"
          />
          <view class="all-selected-title">全部评价人</view>
        </view>
        <scroll-view scroll-y="true" class="grade-popup-scroll">
          <view class="student-wrap" v-if="state.studentVOS.length">
            <view class="student-head">值日生</view>
            <view class="student-list">
              <student-item
                v-for="item in state.studentVOS"
                :key="item.studentId"
                :data="item"
                @selected="onSelected"
                :selected="state.selected?.findIndex(i => i === item.studentId) >= 0"
                selectable
              ></student-item>
            </view>
          </view>
          <view class="student-wrap" style="margin-bottom: 116rpx" v-if="state.teacherVOS.length">
            <view class="student-head">检查人</view>
            <view class="student-list">
              <student-item
                v-for="item in state.teacherVOS"
                :key="item.studentId"
                :data="item"
                :selected="state.selected?.findIndex(i => i === item.studentId) >= 0"
                @selected="onSelected"
                selectable
              ></student-item>
            </view>
          </view> </scroll-view
      ></template>
      <u-empty-custom v-else text="暂无数据" mode="data"></u-empty-custom>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { Student } from '@/app-class-evaluation//types/student-selector';
import CircleCheckbox from '@/app-class-evaluation/components/circle-checkbox.vue';
import StudentItem from '@/app-class-evaluation/components/student-item.vue';
import arrow_down_filed from '@/app-class-evaluation/static/arrow_down_filed.svg';
import { computed, reactive, ref, watch } from 'vue';

const props = defineProps<{
  value?: any[];
  evaluatorData: { studentVOS: any[]; teacherVOS: any[] };
}>();

const state = reactive<{
  data: any[];
  keysMap: Record<number, any & { parent: any }>;
  selected: any[];
  loading: boolean;
  label: string;
  studentVOS: Student[];
  teacherVOS: Student[];
}>({
  data: [],
  keysMap: {},
  selected: [],
  label: '全部评价人',
  loading: false,
  studentVOS: [],
  teacherVOS: [],
});
const show = ref<boolean>(false);
state.studentVOS = computed(() => props.evaluatorData.studentVOS);
state.teacherVOS = computed(() => {
  return props.evaluatorData.teacherVOS.map(item => ({
    studentId: item.userId,
    headImgUrl: item.headImgUrl,
    studentName: item.userName,
    clazzName: item.position,
  }));
});
const allSelected = ref<boolean>(false);
const onAllSelected = () => {
  if (allSelected.value) {
    state.selected = [];
  } else {
    state.selected = [
      ...state.studentVOS.map(i => i.studentId),
      ...state.teacherVOS.map(i => i.studentId),
    ];
  }
  allSelected.value = !allSelected.value;
};
const onSelected = (checked: boolean, data: Student) => {
  const { studentId } = data;
  if (checked) {
    state.selected.push(studentId);
  } else {
    state.selected = state.selected.filter(i => i !== studentId);
  }
};
const emit = defineEmits<{
  (e: 'update:value', value: any[]): void;
  (e: 'change', value: any[]): void;
}>();
watch(
  () => props.value,
  newVal => {
    state.selected = newVal || [];
  },
  { immediate: true },
);
watch(
  () => state.selected.length,
  () => {
    if (state.selected.length === state.studentVOS.length + state.teacherVOS.length) {
      allSelected.value = true;
      state.label = '全部评价人';
    } else {
      if (!state.selected.length) {
        state.label = '全部评价人';
      } else {
        state.label = `已选：${state.selected.length}人`;
      }
      allSelected.value = false;
    }
  },
);

const confirm = () => {
  emit('update:value', state.selected);
  emit('change', state.selected);
  show.value = false;
};

const reset = () => {
  state.selected = [];
  show.value = false;
};

const close = () => {
  show.value = false;
};

const open = () => {
  show.value = true;
};
</script>

<style lang="scss" scoped>
.evaluator-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  &-header {
    padding: 24rpx 32rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
    border-bottom: 1rpx solid $color-bg-layout;
    background: #fff;
  }
  &-title {
    text-align: center;
    color: $color-text;
    flex: 1;
  }
  &-sure {
    color: $color-primary;
  }
  &-cancel {
    color: $color-text-label;
  }
  &-scroll {
    height: 100%;
    flex: 1;
    overflow: hidden;
    padding: 16rpx;
    background: #fff;
  }
  &-content {
    height: 80vh;
    overflow: hidden;
  }
}
.all-selected {
  background: #fff;
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 24rpx 32rpx;
  &-title {
    margin-left: 32rpx;
    color: $color-text;
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
  }
}
.evaluation-grade {
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-right: 40rpx;
  &-text {
    padding-right: 24rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.grade-popup-reset {
  color: $color-text-label;
  margin: 0 12rpx;
  padding: 0 24rpx;
  height: 96rpx;
  line-height: 96rpx;
}
.grade-popup-title {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  padding-right: 100rpx;
}
.grade-popup-scroll {
  height: 100%;
  padding-bottom: 116rpx;
}
.list-filter-item {
  display: flex;
  justify-content: center;
  flex: 2;
  margin-left: 16rpx;
  color: $color-text;
  font-family: 'PingFang SC';
  font-size: 26rpx;
  font-style: normal;
  font-weight: 400;
  overflow: hidden;
  &-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  &-down {
    margin-left: 8rpx;
  }
}
.student-wrap {
  background: #fff;
  padding-left: 32rpx;
}
.student-head {
  margin-top: 8rpx;
  height: 72rpx;
  color: $color-text-label;
  font-family: 'PingFang SC';
  font-size: 26rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 72rpx;
}
</style>
