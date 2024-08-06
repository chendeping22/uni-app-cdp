<template>
  <view
    v-for="(item, inx) in list"
    :key="`health_day_item_${inx}`"
    class="radius-default bg-white plr-l ptb-b mt-b"
    @click="handleClick(item)"
  >
    <view class="flex">
      <c-image :src="icon_detection" :width="96" :height="96" />
      <view class="flex-grow ml-l">
        <view class="font-xt bold">{{ HealthDayCheckType[item.inspectionMode] ?? '/' }}</view>
        <view v-if="item.unInspectedNum > 0" class="font-secondary color-placeholder mt-xxs">
          <text>今日待检查</text>
          <text class="color-blue bold mlr-xxs">{{ item.unInspectedNum }}</text>
          <text>人</text>
        </view>
        <view v-else class="font-secondary color-placeholder mt-xxs">
          <text>今日无需检查</text>
        </view>
      </view>
      <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
    </view>
  </view>
</template>
<script lang="ts">
import { IGetHealthDayTasks } from '@/app-preprimary-education/services/health-day';
import icon_detection from '@/app-preprimary-education/static/svg/detection.svg';
import { HealthDayCheckType } from '@/app-preprimary-education/utils/constant';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    list: { type: Array as PropType<IGetHealthDayTasks[]>, default: () => [] },
    inspectionTaskId: { type: String, default: '' },
  },
  emits: [],
  setup(props) {
    const handleClick = (item: IGetHealthDayTasks) => {
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/task-check/index?title=${
          HealthDayCheckType[item.inspectionMode]
        }&type=${item.inspectionMode}&inspectionTaskId=${props.inspectionTaskId}`,
      });
    };
    return { handleClick, icon_detection, HealthDayCheckType };
  },
});
</script>
<style scoped lang="scss"></style>
