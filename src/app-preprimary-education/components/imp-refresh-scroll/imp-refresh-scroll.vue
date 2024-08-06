<template>
  <scroll-view
    class="components-refresh-scroll-view"
    scroll-y
    refresher-default-style="none"
    :refresher-enabled="refresherEnabled"
    :refresher-threshold="20"
    :refresher-triggered="refresherTriggered"
    :style="{
      height: bodyHeight,
    }"
    @scrolltolower="handleScroll2Bottom"
    @refresherrefresh="handleRefresherrefresh"
  >
    <view v-if="refresherTriggered" class="loading-wrapper">
      <image class="image" :src="icon_spinner_small"></image>
      <text class="txt">加载中...</text>
    </view>
    <view v-if="succ" class="loading-succ">
      <c-icon name="icon_state_succeed" size="44" color-type="white" />
      <text class="txt">刷新成功 </text>
    </view>
    <slot></slot>
    <view v-if="isShowNoMoreTip" class="no-more-tip">没有更多了~</view>
    <view class="h-24 col-24"></view>
  </scroll-view>
</template>
<script lang="ts">
import icon_spinner_small from '@/app-preprimary-education/static/svg/icon_spinner_small.svg';
import { useStore } from '@/store/old';
import { PropType, computed, defineComponent, onMounted, reactive, ref } from 'vue';

/** 数据加载类型 */
export type IDataLoadType = 'new' | 'append';

/** 翻页属性 */
export interface IPager {
  pageNum: number;
  pageSize: number;
  total: number;
}

/**
 * 下拉刷新、触底加载组件.
 * @module imp-refresh-scroll
 * @description 只需要传一个参数fetchDataFunc 即可使用下拉、触底组件. 注意：fetchDataFunc 需要返回一个Promise对象
 * @summary 下拉刷新、触底加载、内置初始化数据，组件内部维护了refresherTriggered, pager, success提示等状态。
 * @example <imp-refresh-scroll :fetchDataFunc="getData" />
 * @property {Boolean} showSuccessTip - 是否下拉刷新后显示成功提示
 * @property {Boolean} autoMount - 是否自动挂载, 即自动初始化数据
 * @property {Boolean} refresherEnabled - 是否组件禁用
 * @property {Boolean} isOpenScroll2Bottom - 是否启用触底功能
 * @property {Number} pageSize - 每页数量
 * @property {String} totalMap - total的字段映射
 * @property {Function} fetchDataFunc - 获取数据的方法, 注意: 一定要return一个Promise对象, 若不需要返回值可以简单的这样return Promise.resolve(1)
 * @property {Boolean} showNoMoreTip - 展示没有更多了提示
 */
export default defineComponent({
  props: {
    showSuccessTip: {
      type: Boolean,
      default: true,
    },
    autoMount: {
      type: Boolean,
      default: true,
    },
    refresherEnabled: {
      type: Boolean,
      default: true,
    },
    isOpenScroll2Bottom: {
      type: Boolean,
      default: true,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    totalMap: {
      type: String,
      default: 'total',
    },
    fetchDataFunc: {
      type: Function as PropType<IFunctionBase<[IPager, IDataLoadType], PromiseLike<any>>>,
      default: () => {},
    },
    showNoMoreTip: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const succ = ref(false);
    const refresherTriggered = ref(false);
    const isScrolling2Bottom = ref(false);
    const pager = reactive({} as IPager);

    const hasNoticeBar = computed(() => {
      const {
        state: {
          inkfish: { hasNotification },
        },
      } = useStore();

      return hasNotification;
    });

    const bodyHeight = computed(() => {
      const {
        state: {
          inkfish: { hasNotification },
        },
      } = useStore();
      const systemInfo = uni.getSystemInfoSync();
      const marginTop = systemInfo.statusBarHeight || 0;
      return hasNotification
        ? `calc(100vh - ${marginTop}px  - 88rpx - 120rpx)`
        : `calc(100vh - ${marginTop}px  - 88rpx)`;
    });

    const isShowNoMoreTip = ref(false);

    /** 初始化翻页属性 */
    const initPager = () => {
      Object.assign(pager, { pageNum: 0, pageSize: props.pageSize, total: Infinity });
    };

    /** 调用接口获取数据 */
    const fetchData = async (type: IDataLoadType) => {
      const res = await props.fetchDataFunc(
        Object.assign({}, pager, { pageNum: pager.pageNum + 1 }),
        type,
      );
      isScrolling2Bottom.value = false;
      if (props.isOpenScroll2Bottom) {
        Object.assign(pager, {
          total: res[props.totalMap],
          pageNum: pager.pageNum + 1,
        });
      }
      return res;
    };

    /** 下拉刷新 */
    const handleRefresherrefresh = async () => {
      isShowNoMoreTip.value = false;
      refresherTriggered.value = true;
      const timeHandle = setTimeout(() => {
        refresherTriggered.value = false;
      }, 6000);
      initPager();
      await fetchData('new');
      refresherTriggered.value = false;
      clearTimeout(timeHandle);
      // 展示成功
      if (props.showSuccessTip) {
        succ.value = true;
        setTimeout(() => {
          succ.value = false;
        }, 2000);
      }
    };

    /** 触底加载 */
    const handleScroll2Bottom = async () => {
      if (isScrolling2Bottom.value) return; // 避免滑动太快, pageNum计算跳空
      isScrolling2Bottom.value = true;
      setTimeout(() => {
        isScrolling2Bottom.value = false;
      }, 1000);
      if (!props.isOpenScroll2Bottom || pager.pageNum * pager.pageSize >= pager.total) {
        isShowNoMoreTip.value = props.showNoMoreTip ? true : false;
        return;
      }
      fetchData('append');
    };

    /** 初始化数据, 可通过ref调用 */
    const initData = () => {
      initPager();
      fetchData('new');
    };

    onMounted(() => {
      initPager();
      props.autoMount && fetchData('new');
    });

    return {
      bodyHeight,
      succ,
      icon_spinner_small,
      refresherTriggered,
      hasNoticeBar,
      handleRefresherrefresh,
      handleScroll2Bottom,
      initPager, // return暴露出来, 可通过ref调用
      fetchData, // return暴露出来, 可通过ref调用
      initData, // return暴露出来, 可通过ref调用
      isShowNoMoreTip,
    };
  },
});
</script>
<style scoped lang="scss">
.loading-wrapper {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  .image {
    height: 40rpx;
    width: 40rpx;
    animation: spin 2s linear infinite;
  }
  .txt {
    margin-left: $ui-gap-small;
    font-size: $ui-font-size-content;
    color: rgba(60, 60, 67, 0.6);
  }
}
.loading-succ {
  height: 80rpx;
  background: $ui-color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  .txt {
    margin-left: $ui-gap-small;
    font-size: $ui-font-size-content;
    color: $ui-color-white;
  }
}
.no-more-tip {
  text-align: center;
  font-size: $ui-font-size-content;
  color: $ui-color-secondary;
  padding: $ui-gap-default 0 calc(env(safe-area-inset-bottom) + $ui-gap-default);
}
</style>
