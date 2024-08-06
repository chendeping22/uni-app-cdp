<template>
  <view :class="[setClassName(), className, 'relative']">
    <view>
      <!--主体内容, 使用插糟-->
      <slot />
    </view>
    <view
      v-if="indexList.length > 0"
      :class="[setClassName('bar'), 'flex-column']"
      :style="style"
      @click.stop="handleClickSideBar"
    >
      <view
        v-for="(item, index) in indexList"
        :key="item"
        :class="[
          setClassName('index'),
          'icon-32 radius-round flex-center mb-xxs',
          `font-${fontSize}`,
          {
            [`color-${activeColorType} bg-${activeBgType}`]: activeAnchorIndex === index,
          },
        ]"
        :data-index="index"
      >
        {{ item }}
      </view>
    </view>
    <!-- 索引提示的插糟 -->
    <slot
      name="c-index-wrap-alert"
      :class="[setClassName('alert')]"
      :char="indexList[activeAnchorIndex]"
    />
  </view>
</template>
<script lang="ts">
import { useClassName } from '@/app-preprimary-education/hooks/use-class-name';
import { uGetDoms } from '@/app-preprimary-education/utils/common';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';
/**
 * 索引组件的包装器, 需要二次封装
 * @summary 新组件, 原组件弃用
 * @description 提供a-z的索引条
 * @param className 样式类, 仅支持公共样式
 * @param zIndex 层级, 默认99
 * @param scrollTop scroll-view的滚动条高度, 必须实时传
 * @param indexList 索引列表, 必须提供, 需自行处理好大小写
 * @param fontSize 索引的尺寸
 * @param activeBgType 索引选中时的背景, 默认primay
 * @param activeColorType 索引选中时的颜色, 默认white
 * @param indexHeaderClass 内容区的索引条的className, 必须传, 用于定位
 */
export default defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'c-index-wrap', // 组件名必传
  props: {
    /** 覆盖该组件的样式类, 仅支持公共样式 */
    className: { type: [String, Array], default: '' },
    /** 层级, 默认99 */
    zIndex: {
      type: Number,
      default: 99,
    },
    /** scroll-view的滚动条高度, 必须实时传 */
    scrollTop: {
      type: Number,
      default: 0,
    },
    /** 索引列表, 必须提供, 需自行处理好大小写 */
    indexList: {
      type: Array,
      default: () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    },
    fontSize: {
      type: String as PropType<IFontSize>,
      default: 'secondary',
    },
    /** 索引选中时的颜色, 默认primary */
    activeBgType: {
      type: String as PropType<IColor>,
      default: 'primary',
    },
    /** 索引选中时的颜色, 默认white */
    activeColorType: {
      type: String as PropType<IColor>,
      default: 'white',
    },
    /** 内容区的索引条的className, 必须传, 用于定位 */
    indexHeaderClass: {
      type: String,
      default: 'c-index-list-index-header',
    },
    /** 需要减去的height */
    minusHeight: {
      type: Number,
      default: 0,
    },
    originListHeight: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['onClickIndex'],
  setup(props, ctx) {
    const instance = getCurrentInstance() as any;
    const setClassName = useClassName();
    const activeAnchorIndex = ref(0);
    const height = ref(0);

    /** 用于防抖, 点击索引及后面的滚动事件有可能会造成二次选中, 引起定位错误 */
    let isDebounce = false;

    let anchorsRect = [] as { height: number; top: number }[];

    /** 索引内容的尺寸 */
    const initIndexContentRects = () => {
      uGetDoms(instance, '.c-index-wrap-bar').then(res => {
        const { height: asHeight = 0 } = res[0] ?? {};
        height.value = asHeight - props.minusHeight;
      });
      uGetDoms(instance.parent, '.' + props.indexHeaderClass).then(ls => {
        if (!ls.length) return;
        const relativeTop = ls[0].top || 0;
        anchorsRect = ls.map((item: any) => ({
          top: item.top - relativeTop,
          height: item.height,
        }));
      });
    };
    const onScroll = () => {
      if (isDebounce) return;
      // activeAnchorIndex.value = anchorsRect.findIndex(
      //   item => item.top + item.height >= props.scrollTop,
      // );
      let total = 0;
      let index = props.originListHeight.findIndex(item => {
        // 找到高度和比当前滚动高度 大的第一个
        let t = total + item?.total;
        if (t > props.scrollTop) {
          return true;
        }
        total = t;
        return false;
      });
      activeAnchorIndex.value = index;
    };

    const style = computed(() =>
      height.value > 0 && props.indexList?.length > 16
        ? {
            zIndex: props.zIndex,
            height: `${height.value}px`,
            overflow: 'auto',
            marginTop: `${-props.minusHeight / 2}px`,
          }
        : { zIndex: props.zIndex },
    );

    watch(
      () => props.scrollTop,
      () => {
        onScroll();
      },
    );

    onMounted(() => {
      initIndexContentRects();
    });

    const handleClickSideBar = (event: any) => {
      if (event.target.dataset.index === undefined) return;
      isDebounce = true;
      setTimeout(() => {
        isDebounce = false;
      }, 200);
      activeAnchorIndex.value = event.target.dataset.index;
      ctx.emit('onClickIndex', activeAnchorIndex.value);
    };
    return { setClassName, activeAnchorIndex, handleClickSideBar, style };
  },
});
</script>
<style lang="scss">
.c-index-wrap-bar {
  position: absolute;
  top: 50%;
  // 给滚动条4px
  right: 4px;
  transform: translateY(-50%);
  user-select: none;
  opacity: 0;
  // 延迟1s动画, 避免索引条从上到下移动
  animation: delayShow 1s ease-in-out 1 forwards;
}
@keyframes delayShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
