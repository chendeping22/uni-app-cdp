<template>
  <view class="history-rcd">
    <view class="icon-112 flex-center bg-white radius-default" @click="handleJump">
      <view class="flex-column">
        <image :src="bar_icon_alarm_record_pitch" class="icon-40" />
        <view class="font-desc color-primary mt-xxs">历史记录</view>
      </view>
    </view>
  </view>
</template>
<script lang="ts">
import bar_icon_alarm_record_pitch from '@/app-preprimary-education/static/image/tabbar/bar_icon_alarm_record_pitch.png';
import { formatDate } from '@/utils/tools';
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    className: { type: [String, Array], default: '' },
  },
  emits: [],
  setup() {
    const now = new Date();
    const today = formatDate(now);
    const handleJump = () => {
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/inspection-record/index?data=${today}&isHistory=1`,
      });
    };
    return { bar_icon_alarm_record_pitch, handleJump };
  },
});
</script>
<style scoped lang="scss">
.history-rcd {
  position: fixed;
  bottom: $ui-gap-base;
  right: $ui-gap-large;
  z-index: 1;
}
</style>
