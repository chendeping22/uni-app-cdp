<template>
  <view v-for="(item, index) in conditionData" :key="index + Math.random()">
    <view class="card-time">
      {{ `${item?.calendarDate.split('-')[1]}月${item?.calendarDate.split('-')[2]}日` }}
      {{ formatterWeek(index) }}
    </view>
    <view class="card-box">
      <cardBox :card-lists="item" @updateCalendar="updateCalendar" @editItem="editItemEvent"
    /></view>
  </view>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import cardBox from './cardBox.vue';

const emit = defineEmits(['updateCalendar', 'editItem']);
const props = defineProps({
  conditionData: {
    type: Array,
    default: () => [],
  },
});
const conditionData = ref<any>(props.conditionData);
watch(
  () => props.conditionData,
  val => {
    conditionData.value = val;
  },
  { immediate: true, deep: true },
);
const updateCalendar = () => {
  emit('updateCalendar');
};
const editItemEvent = (val: any) => {
  emit('editItem', val);
};
const formatterWeek = computed(() => (inx: number) => {
  switch (inx) {
    case 0:
      return '星期一';
    case 1:
      return '星期二';
    case 2:
      return '星期三';
    case 3:
      return '星期四';
    case 4:
      return '星期五';
    case 5:
      return '星期六';
    case 6:
      return '星期日';
  }
});
</script>
<style lang="scss" scoped>
.card-time {
  color: #878787;
  font-size: 30rpx;
}
.card-box {
  padding: 16rpx 0;
}
</style>
