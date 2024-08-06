<template>
  <view id="top_area">
    <!--注意, 仅支持静态的高度, 若动态的则设置最大的高度确保不会变-->
    <slot name="top_area"></slot>
  </view>
  <scroll-view
    :class="[setClassName(), className]"
    :style="{ height: customHeight || bodyHeight, 'min-height': customHeight || bodyHeight }"
    scroll-y
    :refresher-background="'transparent'"
    :refresher-enabled="refresherEnabled"
    :refresher-threshold="threshold"
    refresher-default-style="none"
    :refresher-triggered="refresherTriggered"
    @scrolltolower="handleScroll2Bottom"
    @refresherrefresh="handleRefresherrefresh"
    @refresherpulling="handleRefresherpulling"
    @refresherabort="handleRefresherabort"
  >
    <view style="min-height: 100px">
      <view v-if="showPullTip && !showFreshTip" class="flex-center pb-s">
        <image class="icon-44 spin" :src="iconLoading"></image>
        <text class="font-content color-secondary ml-xs">下拉刷新...</text>
      </view>
      <view v-if="showFreshTip" class="flex-center pb-s">
        <image class="icon-44 spin" :src="iconLoading"></image>
        <text class="font-content color-secondary ml-xs">释放立即刷新</text>
      </view>
      <view v-if="refresherTriggered" class="flex-center height-cell-default">
        <text class="font-content color-secondary ml-xs">加载中...</text>
      </view>

      <view v-if="succ" class="flex-center height-cell-default bg-primary">
        <image class="icon-44" :src="iconStateSucceed"></image>
        <text class="color-white ml-xs">刷新成功 </text>
      </view>
      <view v-if="showList">
        <slot></slot>
      </view>
      <view v-if="showAppendTip" class="flex-center height-cell-default">
        <image class="icon-44 spin" :src="iconLoading"></image>
        <text class="font-content color-secondary ml-xs">更多数据加载中...</text>
      </view>
      <view
        v-if="showErrorTip && !refresherTriggered"
        class="error-tip text-center color-placeholder"
      >
        {{ showErrorTip }}
      </view>
      <view v-if="isShowNoMoreTip" class="no-more-tip text-center color-placeholder">
        没有更多了~
      </view>
      <!--填充行, 内容与底部有个间隙，避免贴在一起，后面与c-page结合-->
      <view :style="`height:${emptyLine}rpx`"></view>
    </view>
  </scroll-view>
</template>
<script lang="ts">
import { debounce } from '@/utils/lodash-es';
import {
  CSSProperties,
  PropType,
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { useClassName } from '../hooks/use-class-name';
import { icon_loading, icon_succeed } from '../utils/icons';

/** 数据加载类型 */
export type IDataLoadType = 'new' | 'append';

declare interface IFunctionBase<T extends any[] = any, R = void> {
  (...args: T): R;
}

/** 翻页属性 */
export interface IPager {
  pageNum: number;
  pageSize: number;
  total: number;
}

/**
 * 下拉刷新、触底加载组件, 场景化组件
 * @summary 新组件, 原组件弃用
 * @description 下拉刷新、触底加载；下拉时显示相关提示, 下拉刷新成功可显示刷新成功
 * @param className 样式类, 仅支持公共样式
 * @param showSuccessTip 下拉刷新成功后, 是否显示成功的提示
 * @param autoMount 初始化时是否自动请求, 默认true
 * @param refresherEnabled 是否可下拉刷新, 默认true
 * @param isOpenScroll2Bottom 是否开启触底加载, 默认true
 * @param pageSize 分页数量
 * @param threshold scroll-view的原生属性, 设置触发下拉事件的下拉长度
 * @param totalMap 记录总数的total字段的字段映射, 默认total
 * @param fetchDataFunc 请求接口的函数, 注意以:fetchDataFunc="XXX"的形式传值, 而非@fetchDataFunc="XXX"
 * @param showNoMoreTip 数据加载完成后, 是否显示“没有更多了”, 默认false
 * @param iconStateSucceed 刷新成功的图标
 * @param iconLoading 下拉加载时显示的loading图标
 */
export default defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'c-refresh-scroll', // 组件名必传
  props: {
    /** 覆盖该组件的样式类, 仅支持公共样式 */
    className: { type: [String, Array], default: '' },
    /** 下拉刷新成功后, 是否显示成功的提示 */
    showSuccessTip: {
      type: Boolean,
      default: true,
    },
    /** 初始化时是否自动请求, 默认true */
    autoMount: {
      type: Boolean,
      default: true,
    },
    /** 是否可下拉刷新, 默认true */
    refresherEnabled: {
      type: Boolean,
      default: true,
    },
    /** 是否开启触底加载, 默认true */
    isOpenScroll2Bottom: {
      type: Boolean,
      default: true,
    },
    /** 分页数量 */
    pageSize: {
      type: Number,
      default: 10,
    },
    /** scroll-view的原生属性, 设置触发下拉事件的下拉长度 */
    threshold: {
      type: Number,
      default: 35,
    },
    /** 记录总数的total字段的字段映射, 默认total */
    totalMap: {
      type: String,
      default: 'total',
    },
    /** 请求接口的函数, 注意以:fetchDataFunc="XXX"的形式传值, 而非@fetchDataFunc="XXX" */
    fetchDataFunc: {
      type: Function as PropType<IFunctionBase<[IPager, IDataLoadType], PromiseLike<any>>>,
      default: () => {},
    },
    /** 数据加载完成后, 是否显示“没有更多了”, 默认false */
    showNoMoreTip: {
      type: Boolean,
      default: false,
    },
    /** 刷新成功的图标 */
    iconStateSucceed: {
      type: String,
      default: icon_succeed,
    },
    /** 下拉加载时显示的loading图标 */
    iconLoading: {
      type: String,
      default: icon_loading,
    },
    /**自定义高度,单位加px*/
    customHeight: {
      type: String,
      default: '',
    },
    /**额外需要减掉的高度*/
    extraHeight: {
      type: Number,
      default: 0,
    },
    /**额外需要减掉的高度*/
    emptyLine: {
      type: Number,
      default: 0,
    },
  },
  emits: [],
  setup(props) {
    const setClassName = useClassName();
    const instance = getCurrentInstance() as any;

    /** TODO: 先不使用, app有兼容问题 */
    const scrollTop = ref(0);
    const oldScrollTop = ref(0);
    const showList = ref(true);

    /** c-refresh-scroll组件上面内容区高度变化的计数器, 若上面高度变了, 可传一个topHeightChangeCount进来, 以便组件调整相应的高度 */
    const { topHeightChangeCount } = inject('topHeightChangeCount', {
      topHeightChangeCount: { value: 0 },
    });

    /** 控制c-page底部的间隙 */
    const { updateShowBottomGap } = inject('showBottomGap', {
      updateShowBottomGap: (() => {}) as any,
    });

    const succ = ref(false);
    const showPullTip = ref(false);
    const showFreshTip = ref(false);
    const showAppendTip = ref(false);
    const showErrorTip = ref('');

    const refresherTriggered = ref(false);
    const isScrolling2Bottom = ref(false);
    const isShowNoMoreTip = ref(false);
    const pager = reactive({} as IPager);

    const tipStyleObj = reactive({ value: { maxHeight: '80rpx' } as CSSProperties });

    const bodyHeight = ref('100px');

    const getBodyHeight = () => {
      const sys: any = uni.getSystemInfoSync();
      uni
        .createSelectorQuery()
        .in(instance)
        .select('#top_area')
        .boundingClientRect(() => {})
        .exec(((ret: any[]) => {
          const obj = ret[0];
          const height = sys.windowHeight - obj.bottom - props.extraHeight ?? 0;
          bodyHeight.value = height + 'px';
        }) as any);
    };

    watch(
      () => topHeightChangeCount.value,
      () => {
        nextTick(() => {
          getBodyHeight();
        });
      },
    );

    /** 初始化翻页属性 */
    const initPager = () => {
      Object.assign(pager, { pageNum: 0, pageSize: props.pageSize, total: Infinity });
    };

    /** 调用接口获取数据 */
    const fetchDataDebounce = debounce((type: IDataLoadType, callback?: () => void) => {
      fetchData(type, callback);
    }, 200);

    const fetchData = async (type: IDataLoadType, callback?: () => void) => {
      if (type === 'new') {
        showList.value = false;
        isShowNoMoreTip.value = false;
      } else if (type === 'append') {
        showAppendTip.value = true;
        isScrolling2Bottom.value = true;
      }
      try {
        const res = await props.fetchDataFunc(
          Object.assign({}, pager, { pageNum: pager.pageNum + 1 }),
          type,
        );
        showList.value = true;
        isScrolling2Bottom.value = false;
        showAppendTip.value = false;
        if (props.isOpenScroll2Bottom) {
          Object.assign(pager, {
            total: res.pagination.total,
            pageNum: pager.pageNum + 1,
          });
        }
        showErrorTip.value = '';
        if (typeof callback === 'function') {
          callback();
        }
      } catch (error: any) {
        if (type === 'new') {
          refresherTriggered.value = false;
        }
        showAppendTip.value = false;
        isScrolling2Bottom.value = false;
        succ.value = false;
        showErrorTip.value = error?.desc || '';
      }
    };

    /** 下拉刷新 */
    const handleRefresherrefresh = async () => {
      showPullTip.value = false;
      showFreshTip.value = false;
      isShowNoMoreTip.value = false;
      refresherTriggered.value = true;
      initPager();
      fetchDataDebounce('new', () => {
        refresherTriggered.value = false;
        // 展示成功
        if (props.showSuccessTip) {
          succ.value = true;
          setTimeout(() => {
            succ.value = false;
          }, 1000);
        }
      });
    };

    /** 触底加载 */
    const handleScroll2Bottom = async () => {
      if (isScrolling2Bottom.value || refresherTriggered.value) {
        // 避免滑动太快, pageNum计算跳空
        return;
      }
      if (!props.isOpenScroll2Bottom || pager.pageNum * pager.pageSize >= pager.total) {
        isShowNoMoreTip.value = props.showNoMoreTip ? true : false;
        return;
      }
      fetchDataDebounce('append');
    };

    const handleRefresherpulling = (e: any) => {
      if (refresherTriggered.value || succ.value) return;
      let dy = 0;
      // #ifdef H5
      dy = e.detail.deltaY;
      // #endif

      // #ifdef MP-WEIXIN || APP-PLUS
      dy = e.detail.dy;
      // #endif

      showPullTip.value = true;
      if (dy > props.threshold) {
        showFreshTip.value = true;
      } else {
        showFreshTip.value = false;
        showPullTip.value = false;
      }
    };

    /** 下拉未到阈值就松开时触发 */
    const handleRefresherabort = () => {
      showPullTip.value = false;
    };

    const handleScroll = (e: any) => {
      oldScrollTop.value = e.detail.scrollTop;
    };

    /** 初始化数据, 可通过ref调用 */
    const initData = () => {
      initPager();

      fetchDataDebounce('new');
    };

    onBeforeMount(() => {
      updateShowBottomGap(false);
    });

    onMounted(async () => {
      setTimeout(() => {
        getBodyHeight();
      }, 50);
      initPager();
      props.autoMount && fetchData('new');
    });

    return {
      setClassName,
      bodyHeight,
      showPullTip,
      showFreshTip,
      showAppendTip,
      succ,
      scrollTop,
      tipStyleObj,
      icon_spinner_small: '',
      refresherTriggered,
      handleRefresherrefresh,
      handleRefresherpulling,
      handleScroll2Bottom,
      handleRefresherabort,
      handleScroll,
      initPager, // return暴露出来, 可通过ref调用
      fetchData, // return暴露出来, 可通过ref调用
      initData, // return暴露出来, 可通过ref调用
      isShowNoMoreTip,
      showList,
      showErrorTip,
    };
  },
});
</script>
<style lang="scss">
.icon-44 {
  width: 44rpx;
  height: 44rpx;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.pb-s {
  padding-bottom: 16rpx;
}
.spin {
  animation: spin 1.5s linear infinite;
}
.font-content {
  font-size: 28rpx;
}
.color-secondary {
  color: #4e5969;
}
.ml-xs {
  margin-left: 12rpx;
}
.height-cell-default {
  height: 88rpx;
}
.bg-primary {
  background: #176bfb;
}
.color-white {
  color: #ffffff;
}
.text-center {
  text-align: center;
}
.color-placeholder {
  color: #86909c;
}
// .no-more-tip {
//   text-align: center;
//   font-size: $ui-font-size-content;
//   color: $ui-color-secondary;
//   padding: $ui-gap-default 0 calc(env(safe-area-inset-bottom) + $ui-gap-default);
// }
</style>
