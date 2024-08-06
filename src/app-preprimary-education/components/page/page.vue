<template>
  <view
    :class="[
      'root-page family-regular',
      `page-bg-${bgType}`,
      { 'has-nav-bar': showNavBar, 'has-notice-bar': showNoticeBar && hasNotice },
    ]"
    :style="{
      paddingTop: showNavBar ? `calc(${statusBarHeight}px + 88rpx)` : `${statusBarHeight}px`,
    }"
  >
    <imp-nav-bar
      v-if="showNavBar"
      class="imp-nav-bar"
      :title="title"
      :bg-type="bgType"
      :color="navBarColor"
      :auto-back="autoBack"
      :back-icon="backIcon"
      :left-text="leftText"
      @clickLeft="clickLeft"
    >
      <template #left><slot name="headerLeftIcon" /></template>
      <template #right><slot name="headerRightIcon" /></template>
    </imp-nav-bar>

    <view
      :class="{
        'page-body': true,
        'page-padding': hasPadding,
      }"
    >
      <slot v-if="pageLoadingStatus === 0" name="loading"></slot>
      <slot v-if="pageLoadingStatus === 1"></slot>
      <slot v-if="pageLoadingStatus === 2" name="loading_error"></slot>
    </view>

    <imp-top v-if="showNoticeBar" :bg-type="bgType" :show-nav-bar="showNavBar" />
    <!--#ifdef APP-PLUS-->
    <console />
    <imp-messages-cover></imp-messages-cover>
    <!--#endif-->
  </view>
</template>
<script lang="ts">
import ImpNavBar from '@/app-preprimary-education/components/imp-nav-bar/imp-nav-bar.vue';
import ImpTop from '@/app-preprimary-education/components/imp-top/imp-top.vue';
import { useStore } from '@/store/old';
import { PropType, computed, defineComponent } from 'vue';

export type IBgType =
  | 'gradient'
  | 'white'
  | 'gray'
  | 'primary'
  | 'blue'
  | 'welcome'
  | 'clock-in'
  | 'normal';
export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    navBarColor: {
      type: String,
      default: '',
    },
    // 背景颜色的类型
    bgType: {
      type: String as PropType<IBgType>,
      default: 'gradient',
    },
    // 仅控制左右的padding, 这样页面比较方便
    // padding-top留给了nar-bar
    hasPadding: {
      type: Boolean,
      default: false,
    },
    showNavBar: {
      type: Boolean,
      default: true,
    },
    showNoticeBar: {
      type: Boolean,
      default: true,
    },
    autoBack: {
      type: Boolean,
      default: true,
    },
    backIcon: {
      type: Boolean,
      default: false,
    },
    /** 页面加载状态: 1-成功(展示slot), 0-加载中(展示加载动画), 2-失败(展示加载失败页)。 默认1, 即不处理 */
    pageLoadingStatus: {
      type: Number as PropType<0 | 1 | 2>,
      default: 1,
    },
    autoPageLoadingStatus: {
      type: Boolean,
      default: false,
    },
    leftText: {
      type: String,
      default: '',
    },
    clickLeft: {
      type: Function,
      default: () => {},
    },
  },
  components: { ImpNavBar, ImpTop },
  setup(props) {
    // const {
    //   state: {
    //     system: { systemInfo },
    //   },
    //   commit,
    // } = useStore();

    const statusBarHeight = props.showNavBar ? uni.getSystemInfoSync().statusBarHeight || 0 : 0;
    const hasNotice = computed(() => {
      const {
        state: {
          inkfish: { hasNotification },
        },
      } = useStore();
      return hasNotification;
    });

    // onBeforeMount(async () => {
    //   commit(PAGE_COMMITS.setPageLoadingStatus, props.autoPageLoadingStatus ? 0 : 1);
    // });

    return {
      hasNotice,
      statusBarHeight,
    };
  },
});
</script>

<style lang="scss" scoped>
$height-nav-bar: 88rpx;
$height-notice-bar: 120rpx;

.root-page {
  position: relative;
  box-sizing: border-box;
  overflow: auto;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 100vh;

  .page-body.page-padding {
    padding-left: $ui-gap-large;
    padding-right: $ui-gap-large;
  }

  .page-body {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    /**
     * overflow: auto这种写法，实际上是有问题的。
     *
     * 项目有些地方的page body的内容是一个 card 加上一个 scroll-view 。
     * 如果 overflow 是 auto ，那么页面就会可能有两个滚动条：
     *   1. page-body的滚动条
     *   2. scroll-view的滚动条
     * 这种情况下，两个滚动条可能就会导致你的样式和UE设计完全是不一致的。
     * 因为一旦你触发的是page-body的滚动条，那么card就有可能被滚上去。
     *
     * 那么是不是overflow:hidden就好了？
     * 答案显然是否定的。overflow:hidden会导致一些没有使用scroll-view的页面不能滚动，依然会有BUG。
     *
     * 假设还有notice-bar，那么需要顾虑的样式问题，可能就更多了。
     */
    overflow: auto;
    position: relative;
  }

  .imp-nav-bar {
    flex-shrink: 0;
    flex-grow: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
  }
  // &.has-notice-bar .page-body {
  //   height: calc(100% - 120rpx);
  // }
  &.page-bg {
    &-white {
      background: $ui-color-white;
    }
    &-gray {
      background: linear-gradient(60deg, #eef5fc, #f7f5f5, #eef5fc);
    }
    &-primary {
      background: $ui-color-primary;
    }
    &-gradient {
      // background-image: url(/static/image/icon_bg.jpg);
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
    &-blue {
      // background: $ui-color-primary;
    }
    &-welcome {
      background: $ui-color-primary;
    }
    &-clock-in {
      background: $ui-color-fill-default;
    }
    &-normal {
      background: $ui-color-fill-default;
    }
  }
}
</style>
