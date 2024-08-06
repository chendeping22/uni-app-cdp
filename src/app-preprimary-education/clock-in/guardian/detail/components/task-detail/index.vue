<template>
  <!--标题-->
  <imp-header :title="detail.title" is-card-header extra-right>
    <template #extra>
      <view :class="`task-status-${detail.status}`">
        {{ detail.status === 1 ? '进行中' : '已结束' }}
      </view>
    </template>
    <template #summary>
      <imp-space class-name="font-secondary color-disabled" gap-size="xs">
        <text class="mr-xs">{{ detail.personName }}老师</text>
        <text class="mr-xs">发布于</text>
        <text class="mr-xs">{{
          detail.createTime && formatDate(detail.createTime, 'YYYY-MM-DD hh:mm')
        }}</text>
      </imp-space>
    </template>
  </imp-header>
  <!--标签-->
  <imp-space wrap>
    <text v-for="(t, inx) in tags" :key="'tag_' + inx" class="detail-tag mr-b mb-b">{{ t }}</text>
  </imp-space>
  <!--内容-->
  <view v-if="showExpand && expand" class="text-pre detail-content">
    {{ detail.content }}
  </view>
  <view v-else class="detail-content">
    {{ contentLen > 76 ? `${subStringByHalfAngle(detail.content, 76)}...` : detail.content }}
  </view>
  <!--图片-->
  <imp-media v-if="expand" :medias="detail.medias" @videoData="videoDataEvent" />
  <!-- 收缩栏-->
  <view v-if="showExpand" class="expand-bar mt-l" @click="expand = !expand">
    <view :class="[expand ? 'rorate-up' : 'rorate-down']">
      <uni-icons color="#9797AB" type="back" size="24" />
    </view>
  </view>
</template>
<script lang="ts">
import ImpHeader from '@/app-preprimary-education/components/imp-header/imp-header.vue';
import ImpMedia from '@/app-preprimary-education/components/imp-media/imp-media.vue';
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import { IGetClockInDetailRtn } from '@/app-preprimary-education/services/clock-in';
import { strLen, subStringByHalfAngle } from '@/app-preprimary-education/utils/tools';
import { formatDate } from '@/utils/tools';
import { PropType, computed, defineComponent, ref } from 'vue';

export default defineComponent({
  components: { ImpHeader, ImpSpace, ImpMedia },
  props: {
    detail: { type: Object as PropType<IGetClockInDetailRtn>, default: () => {} },
  },
  emits: [],
  setup(props) {
    const expand = ref(false);
    const contentLen = computed(() => {
      return strLen(props.detail.content);
    });

    const showExpand = computed(() => {
      return contentLen.value > 76 || props.detail.medias?.length > 0;
    });

    /** 标签 */
    const tags = computed(() => {
      const { detail } = props;

      const temp: string[] = [];
      if (!detail.id) return temp;
      const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      // 1. 已进行
      if (detail.status === 1) {
        temp.push(`已进行${detail.currentDay}/${detail.totalDay}天`);
      }

      // 2. 打卡频次
      const rates = detail.rate.split(',');
      const rate_text = rates.length === 7 ? '天' : rates.map(r => weeks[Number(r)]).join('、');
      temp.push(`每${rate_text}打卡`);
      // 3. 允许补卡
      detail.enabledRetry === 1 && temp.push('允许补卡');
      return temp;
    });

    const videoDataEvent = (data: any) => {
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/video-detail?fileUrl=${data}`,
      });
    };

    return {
      formatDate,
      tags,
      expand,
      showExpand,
      subStringByHalfAngle,
      contentLen,
      videoDataEvent,
    };
  },
});
</script>
<style scoped lang="scss">
.task-status {
  &-1 {
    font-size: $ui-font-size-secondary;
    padding: $ui-gap-xxs $ui-gap-xs;
    border-radius: $ui-radius-large;
    color: $ui-color-white;
    background: $ui-color-blue;
  }
  &-2 {
    font-size: $ui-font-size-secondary;
    padding: $ui-gap-xxs $ui-gap-xs;
    border-radius: $ui-radius-large;
    color: $ui-color-placeholder;
    background: $ui-color-line-default;
  }
}
.detail-tag {
  flex-shrink: 0;
  height: 36rpx;
  line-height: 36rpx;
  padding: 0 $ui-gap-xs;
  background: rgba($ui-color-primary, 0.1);
  border-radius: $ui-radius-small;
  font-size: $ui-font-size-desc;
  color: $ui-color-primary;
}
.detail-content {
  font-size: $ui-font-size-title;
  color: $ui-color-base;
  line-height: 48rpx;
  margin: $ui-gap-default 0;
  word-break: break-all;
}
.expand-bar {
  height: 56rpx;
  background: rgba($ui-color-base, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  .rorate-up {
    transform: rotate(90deg);
    width: 48rpx;
    height: 48rpx;
  }
  .rorate-down {
    transform: rotate(-90deg);
    width: 48rpx;
    height: 48rpx;
  }
}
</style>
