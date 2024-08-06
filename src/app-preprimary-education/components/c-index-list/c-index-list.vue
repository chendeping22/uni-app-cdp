<template>
  <view :class="[setClassName(), className]">
    <CIndexWrap
      :index-list="indexList"
      :scroll-top="scrollTop"
      :index-header-class="setClassName('index-header')"
      :minus-height="minusHeight"
      :origin-list-height="originListHeight"
      @onClickIndex="handleClickIndex"
    >
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
    </CIndexWrap>
  </view>
</template>
<script lang="ts">
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
import CIndexWrap from '../c-index-wrap/c-index-wrap.vue';
import VirtualScrolling from './virtual-scrolling.vue';

interface Items {
  index: number;
  listLen: number;
  list: number;
  total: number;
  key: string;
  itemHeight: number;
  cIndex: number;
  charHeight: number;
  top: number;
}

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
  name: 'c-index-list',
  components: { CIndexWrap, VirtualScrolling },
  props: {
    /** 覆盖该组件的样式类, 仅支持公共样式 */
    className: { type: [String, Array], default: '' },
    /** 容器高度, 若有值须自带单位, 若无值会自动计算到窗口底部 */
    height: {
      type: Number,
      default: 0,
    },
    /** 需要减去的height */
    minusHeight: {
      type: Number,
      default: 0,
    },
    /** list 数据必须按 ABCD...先分组好, char是ABC..这些分组名称, dataList是每组的数据 */
    list: {
      type: Array as PropType<
        {
          char: string;
          dataList: any[];
        }[]
      >,
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
    const nextCharList = ref([]);
    const scrollHeight = ref(0);
    const nowList = ref([]);
    const itemHeight = ref(65);
    const charHeight = ref(39);
    const originListHeight = ref<Items[]>([]);
    const listScrollTop = ref(0);
    const virtualRef = ref(null);

    const indexList = computed(() => {
      return props.list.length
        ? props.list.map(l => l.char)
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    });

    // 打平数据
    const flatData = computed(() => {
      return props.list.reduce((pre, next) => {
        const lastItem = pre.slice(-1)[0];
        return [
          ...pre,
          ...[
            {
              name: next.char,
              type: 'char',
              total: (lastItem?.total || 0) + (next.dataList?.length || 0),
            },
            ...next.dataList,
          ],
        ];
      }, []);
    });

    const handleClickIndex = (index: number) => {
      const key = indexList.value[index];
      const heightData = originListHeight.value.find(item => item.key === key);

      if (!heightData || scrollHeight.value - wrapHeight.value <= wrapHeight.value / 2) {
        virtualRef.value?.reset();
        return;
      }
      const top = heightData?.cIndex * itemHeight.value;
      if (scrollTop.value - top <= charHeight.value && scrollViewId.value === `index-char-${key}`) {
        return;
      }

      scrollTop.value = top;
      scrollViewId.value = '';
      virtualRef.value?.handleWrapScroll(top);
      nextTick(() => {
        uGetDom(instance, '#' + `index-char-${key}`).then((res: any) => {
          scrollViewId.value = `index-char-${key}`;
        });
      });
    };

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
          uGetDom(instance, '.' + setClassName('char')).then((res: any) => {
            charHeight.value = res?.height || 39;
            uGetDom(instance, '.' + setClassName('item')).then((res: any) => {
              itemHeight.value = res?.height || 65;
            });
          });
        });
      }
    });

    watchEffect(() => {
      let total = 0;
      let cIndex = 0;
      originListHeight.value = [];
      props.list.forEach((item, index) => {
        const value = item.dataList;
        originListHeight.value.push({
          index,
          itemHeight: itemHeight.value,
          charHeight: charHeight.value,
          listLen: value.length,
          list: value.length * itemHeight.value,
          total: value.length * itemHeight.value + charHeight.value,
          key: item.char,
          top: total,
          cIndex,
        });
        total += value.length * itemHeight.value + charHeight.value;
        cIndex += value.length + 1;
      });
      scrollHeight.value = total;
    });

    return {
      setClassName,
      indexList,
      scrollViewId,
      wrapHeight,
      scrollTop,
      handleClickIndex,
      nextCharList,
      flatData,
      setList,
      nowList,
      scrollHeight,
      listScrollTop,
      originListHeight,
      virtualRef,
      itemHeight,
    };
  },
});
</script>
<style lang="scss"></style>
