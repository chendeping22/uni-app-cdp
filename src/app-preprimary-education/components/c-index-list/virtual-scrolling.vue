<!--  -->
<template>
  <scroll-view
    ref="scrollRef"
    class="container"
    scroll-y
    show-scrollbar
    :scroll-top="datas.scrollTop"
    :style="{ height: boxH + 'px' }"
    :scroll-into-view="scrollViewId"
    @scroll="handleScroll"
    @scrolltolower="handleScrollEnd"
  >
    <view class="scroll-box" :style="{ height: scrollHeight + 'px' }">
      <view class="list-wrap" :style="{ transform: 'translateY(' + datas.offsetY + 'px)' }">
        <slot></slot>
      </view>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
const $emit = defineEmits(['setList', 'scrolltolower']);
const props = defineProps({
  // 外层盒子高度
  boxH: {
    type: Number,
    required: true,
  },
  // 每个元素的高度
  itemH: {
    type: Number,
    required: true,
  },
  // 列表数据
  list: {
    type: Array,
    default: () => [],
    required: true,
  },
  // 上下多出n个列表项用于加载缓存
  cacheNum: {
    type: Number,
    default: 4,
  },
  listNum: {
    type: Number,
    required: true,
  },
  columnNum: {
    //一行展示几列
    type: Number,
    required: false,
    default: 1,
  },
  defaultIndex: {
    type: Number,
    default: 0,
  },
  scrollHeight: {
    type: Number,
    required: true,
  },
  scrollViewId: {
    type: String,
    default: '0',
  },
  wrapScroll: {
    type: Number,
    required: true,
  },
});
const datas: any = reactive({
  nowList: [], // 目前显示列表
  lastUpdateTime: 0,
  offsetY: 0,
  defaultIndex: 0,
  scrollTop: 0,
  scrollTopBacktop: 0,
});
const scrollRef = ref();
const pageNum: any = computed(() => {
  return 20; //Math.ceil(props.boxH / props.itemH) + props.cacheNum * props.columnNum;
});
let isDebounce = false;

onMounted(() => {
  init();
});
watch(
  () => props.list,
  n => {
    init();
  },
);
const init = () => {
  if (datas.defaultIndex % 2 != 0) {
    datas.defaultIndex = datas.defaultIndex - 1;
  }

  datas.nowList = props.list.slice(
    datas.defaultIndex,
    datas.defaultIndex + pageNum.value + props.columnNum,
  );
  $emit('setList', datas.nowList);
  setTimeout(() => {
    // 预留时间让页面渲染后执行，否则高度可能不足
    datas.scrollTop = (datas.defaultIndex / props.columnNum) * props.itemH;
  }, 10);
};

const computedData = (top: number) => {
  const scrollTop = top + 1; // +1是因为插件所有的scroll都是返回整数
  datas.scrollTopBacktop = top;
  // 1.保持显示区域一直在屏幕上
  datas.offsetY = scrollTop - (scrollTop % props.itemH);
  // 2.计算卷起多少个，替换更新
  let startIndex = Math.floor(scrollTop / props.itemH) * props.columnNum;

  // let endIndex = startIndex + pageNum

  // 3.当向上卷起的数量超过缓存个数的时候，上面缓存设置,扩大显示区域
  // 卷起的高度要去除缓存部分,同时修改起始位置
  if (startIndex > props.cacheNum / props.columnNum) {
    datas.offsetY -= (props.cacheNum / props.columnNum) * props.itemH;
    startIndex = startIndex - props.cacheNum;
  }
  datas.defaultIndex = startIndex;
  // 4 更新当前显示内容
  datas.nowList = props.list.slice(startIndex, startIndex + pageNum.value);
  $emit('setList', datas.nowList, scrollTop);
};
const handleScroll = (e: any) => {
  //if (isDebounce) return;
  computedData(e.detail.scrollTop);
};

const handleWrapScroll = (wrapScroll: number) => {
  isDebounce = true;
  setTimeout(() => {
    isDebounce = false;
  }, 300);
  computedData(wrapScroll);
  setTimeout(() => {
    // 预留时间让页面渲染后执行，否则高度可能不足
    datas.scrollTop = datas.scrollTopBacktop;
  }, 10);
};

onBeforeUnmount(() => {
  reset();
});

// 滚动到底部触发
const handleScrollEnd = () => {
  $emit('scrolltolower', 'end');
};
// 重置scroll
const reset = () => {
  datas.defaultIndex = 0;
  nextTick(() => {
    datas.scrollTop = 1;
    init();
  });
};
defineExpose({
  reset,
  handleWrapScroll,
});
</script>

<style lang="scss" scoped></style>
