<template>
  <view
    v-if="hasNotice && notice !== null"
    :class="['notice-bar-wrapper', `imp-top-bg-${bgType}`]"
    :style="{ top: showNavBar ? `calc(${statusBarHeight}px + 88rpx)` : `${statusBarHeight}px` }"
  >
    <uni-notice-bar
      background-color="#eff2fd"
      class="imp-notice-bar"
      color="#4966f5"
      scrollable
      show-icon
      show-close
      single
      :border-radius="32"
      :speed="50"
      :text="notice.content"
      @close="dismissNotice"
    />
  </view>
  <!-- <imp-empty-line
    v-if="hasNotice && notice !== null"
    size="noticebar"
    :class-name="`imp-top-bg-${bgType}`"
  /> -->
</template>
<script lang="ts">
import { getNotification } from '@/app-preprimary-education/services/inkfish';
import { INKFISH_COMMITS, useStore } from '@/store/old';
import { onShow } from '@dcloudio/uni-app';
import { PropType, computed, defineComponent, inject, ref } from 'vue';

export type IBgType = 'gradient' | 'white' | 'gray' | 'primary' | 'blue' | 'welcome' | 'clock-in';
export default defineComponent({
  props: {
    bgType: {
      type: String as PropType<IBgType>,
      default: 'gradient',
    },
    showNavBar: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const { commit } = useStore();
    const systemInfo = uni.getSystemInfoSync();
    const hasNotice = computed(() => {
      const {
        state: {
          inkfish: { hasNotification },
        },
      } = useStore();
      return hasNotification;
    });

    interface Notice {
      appScope: number | null;
      appletScope: number | null;
      content: string | null;
      dismissed: boolean;
      id: string | null;
      status: number | null;
      syncedAt: number;
      webScope: number | null;
    }
    const notice = ref<Notice | null>(null);

    const { updateTopHeightChangeCount } = inject('topHeightChangeCount', {
      updateTopHeightChangeCount: () => {},
    });

    const statusBarHeight = props.showNavBar ? systemInfo.statusBarHeight || 0 : 0;

    const syncNotification = async () => {
      /**
       * 这里获取inkfish的notification状态并不能放到外面，因为闭包的关系，状态会被缓存。
       * 如果你在另外一个页面dismiss notification，当你返回的时候，上一个页面notice bar依然会展示。
       */
      const {
        state: {
          inkfish: { notification },
        },
      } = useStore();
      const tenMinutes = 10 * 60 * 1000; //  每隔十分钟监测一次
      const sync =
        notification === null ||
        (notification !== null && notification.syncedAt < Date.now() - tenMinutes);

      if (sync) {
        const { content, ...others } = await getNotification();
        const latest = {
          content: content?.replace(/(\n|\r|\r\n)/g, '') || '',
          dismissed: notification !== null ? notification.dismissed : false,
          syncedAt: Date.now(),
          ...others,
        };
        commit(INKFISH_COMMITS.setNotification, latest);

        return latest;
      }

      return notification;
    };

    const dismissNotice = () => {
      commit(INKFISH_COMMITS.dismissNotification);
      updateTopHeightChangeCount();
    };

    onShow(async () => {
      notice.value = await syncNotification();
    });

    return { hasNotice, statusBarHeight, notice, dismissNotice };
  },
});
</script>
<style lang="scss" scoped>
.notice-bar-wrapper {
  background: transparent;
  left: 0;
  padding: $ui-gap-xs $ui-gap-large;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 999999;
}
</style>
