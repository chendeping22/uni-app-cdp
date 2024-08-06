<template>
  <view :class="[setClassName(), className]">
    <VirtualScrolling
      ref="virtualRef"
      :box-h="wrapHeight"
      :item-h="itemHeight"
      :scroll-height="scrollHeight"
      :list-num="flatData.length"
      :list="flatData"
      :scroll-view-id="scrollViewId"
      :wrap-scroll="listScrollTop"
      @setList="setList"
    >
      <view
        v-for="(item, index) in nowList"
        :id="`index-${item.type === 'char' ? 'char-' + item.name : 'header-' + index}`"
        :key="`index-header-${index}`"
        :name="`index-${item.type === 'char' ? 'char-' + item.name : 'header-' + index}`"
        :class="[setClassName(`${item.type === 'char' ? 'char' : 'item'}`)]"
      >
        <template v-if="item.type === 'char'">
          <slot name="indexHeader" :char="item.name">
            <view
              :id="`index-char-${item.total}`"
              :class="['height-button-xs flex bg-transparent']"
            >
              <text class="font-base bold color-placeholder ml-b">{{ item.name }}</text>
            </view>
          </slot>
        </template>
        <template v-else>
          <slot name="cell" :item="item" :isFirst="index === 0">
            <view class="bg-white mtb-s p-all-b radius-default">
              <view>名字: {{ item.name }}</view>
            </view>
          </slot>
        </template>
      </view>
    </VirtualScrolling>
  </view>
</template>
<script lang="ts">
import VirtualScrolling from '@/app-preprimary-education/components/c-index-list/virtual-scrolling.vue';
import { useClassName } from '@/app-preprimary-education/hooks/use-class-name';
import { uGetDom } from '@/app-preprimary-education/utils/common';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  PropType,
  ref,
  watchEffect,
} from 'vue';

/**
 * 索引列表组件
 * @summary 新组件, 原组件弃用
 * @description 索引列表组件
 * @param className 样式类, 仅支持公共样式
 * @param height 容器高度, 默认'', 若有值需要自带单位
 * @param list 数据列表, 必须按索引分类, 即格式必须是 {char: string; dataList: any[]}[]
 */

export default defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'virtual-scrolling-list',
  components: { VirtualScrolling },
  props: {
    /** 覆盖该组件的样式类, 仅支持公共样式 */
    className: { type: [String, Array], default: '' },
    /** 容器高度, 若有值须自带单位, 若无值会自动计算到窗口底部 */
    height: {
      type: Number,
      default: 0,
    },
    list: {
      type: Array as PropType<any>,
      default: () => [],
    },
  },
  emits: [],
  setup(props) {
    const setClassName = useClassName();
    const systemInfo: any = uni.getSystemInfoSync();
    const instance = getCurrentInstance() as any;
    const wrapHeight = ref(0);
    const scrollViewId = ref('');
    const scrollTop = ref(0);
    const scrollHeight = ref(0);
    const nowList = ref([]);
    const itemHeight = ref(65);
    const listScrollTop = ref(0);
    const virtualRef = ref(null);

    // 打平数据
    const flatData = computed(() => {
      return props.list;
    });

    const setList = (list: any, top: number) => {
      nowList.value = list;
      scrollTop.value = top || 0;
    };

    onMounted(() => {
      if (props.height) {
        wrapHeight.value = props.height;
      } else {
        uGetDom(instance, '.' + setClassName()).then((res: any) => {
          wrapHeight.value =
            systemInfo.windowHeight -
            (systemInfo.safeAreaInsets?.bottom || 0) -
            2 -
            (res?.top || 0);
        });

        nextTick(() => {
          uGetDom(instance, '.' + setClassName('item')).then((res: any) => {
            itemHeight.value = res?.height || 65;
          });
        });
      }
    });

    watchEffect(() => {
      scrollHeight.value = props.list.length * itemHeight.value;
    });

    return {
      setClassName,
      scrollViewId,
      wrapHeight,
      scrollTop,
      flatData,
      setList,
      nowList,
      scrollHeight,
      listScrollTop,
      virtualRef,
      itemHeight,
    };
  },
});
</script>
<style lang="scss"></style>
