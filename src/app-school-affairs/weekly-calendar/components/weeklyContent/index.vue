<template>
  <view class="container">
    <cardBox
      v-if="props.viewType"
      :view-type="props.viewType"
      :card-lists="props.cardLists"
      @updateCalendar="updateCalendar"
      @editItem="editItemEvent"
    />
    <cardList
      v-else
      :view-type="props.viewType"
      :condition-data="props.conditionData"
      @updateCalendar="updateCalendar"
      @editItem="editItemEvent"
    />
  </view>
</template>
<script lang="ts" setup>
import cardBox from './cardBox.vue';
import cardList from './cardList.vue';

const emit = defineEmits(['updateCalendar', 'editItem']);
const props = defineProps({
  cardLists: {
    type: Array,
    default: [],
  },
  conditionData: {
    type: Array,
    default: [],
  },
  viewType: {
    type: Boolean,
  },
});
const updateCalendar = () => {
  emit('updateCalendar');
};
const editItemEvent = (val: any) => {
  emit('editItem', val);
};
</script>
<style lang="scss" scoped>
.container {
  padding: 24rpx 32rpx 50rpx;
}
</style>
