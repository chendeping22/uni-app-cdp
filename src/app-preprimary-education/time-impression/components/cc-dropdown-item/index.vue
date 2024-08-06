<template>
  <scroll-view v-if="isActive" scroll-y :class="[setClassName(), className, 'bg-white plr-l2']">
    <view
      v-for="(item, inx) in list"
      :key="`item_${item.title}_${inx}`"
      :class="[setClassName('item-wrap'), 'height-cell-default flex-between plr-l']"
      hover-class="bg-fill-light"
      hover-start-time="10"
      hover-stay-time="10"
      @click="handleClickItem(item)"
    >
      <text :class="[setClassName('item-text'), { 'color-primary': item.value === value }]">
        {{ item.label }}
      </text>
      <c-icon v-if="item.value === value" name="icon_succeed" :size="40" color-type="primary" />
    </view>
    <slot></slot>
  </scroll-view>
</template>
<script lang="ts">
import {
  PropType,
  computed,
  defineComponent,
  inject,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';
import { useClassName } from '../../../hooks/use-class-name';
import { uiColor } from '../../../utils/ui-js-value';

type ICDropdownItemType = 0 | 1 | 2 | 3 | 4; // 0-只有标题无箭头和面板 1-下拉框 2-筛选, 3-有面板但无箭头, 4-只有标题箭头

export interface ICDropdownItem {
  title: string;
  valueLabel: any;
  type: ICDropdownItemType;
  width: string;
}

export interface ICDropdownItemList {
  label: string;
  value: any;
  [k: string]: any;
}

/**
 * dropdown筛选组件, 子组件
 * @summary 新组件, 原组件弃用
 * @description 子组件, 一共有4种类型, 支持切换、下拉、筛选及自定义。
 * @param className 样式类, 仅支持公共样式
 * @param title 标题, 必填
 * @param type 筛选的类型, 默认1. (0-只有标题无箭头和面板, 1-下拉框, 2-排序, 3-有面板但无箭头)
 * @param list type为1即下拉框时的列表
 * @param value type为1即下拉框时的默认值, 须按双向绑定的方式使用
 */
export default defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'cc-dropdown-item', // 组件名必传
  props: {
    /** 覆盖该组件的样式类, 仅支持公共样式 */
    className: { type: [String, Array], default: '' },
    /** 标题, 必填 */
    title: { type: String, default: '' },
    /** 0 \| 1 \| 2 \| 3 | 1 | 筛选的类型, 0-只有标题无箭头和面板,
     *  1-下拉框, 2-排序, 3-有面板但无箭头(0和2不会弹出面板, 1和3会弹出面板)
     */
    type: { type: Number as PropType<ICDropdownItemType>, default: 1 },
    /** type 为 1 时的下拉选项, 每项至少要有 label 和 value 的属性 */
    list: {
      type: Array as PropType<ICDropdownItemList[]>,
      default: () => [],
    },
    /** type 为 1 时的下拉选项的默认值 */
    value: { type: [String, Number], default: '' },
    /** 最大宽度, 需要自带单位 */
    width: { type: String, default: '180rpx' },
    extra: { type: Object, default: null }, // 额外的业务配置
    name: { type: String, default: '' }, // 用于区别item
  },
  emits: ['update:value', 'onSelect'],
  setup(props, ctx) {
    const setClassName = useClassName();
    const { menus, updateMenu, addMenu } = inject<any>('dropdown-menu');
    const selfIndex = computed(() => {
      return menus.findIndex((tmp: ICDropdownItem) => tmp.title === props.title);
    });
    const isActive = ref(false);

    const actionEvent = (obj: { repeatStatus: number; curInx: number }) => {
      if (obj.curInx !== selfIndex.value) {
        isActive.value = false;
        return;
      }
      if (obj.repeatStatus === 1) {
        isActive.value = true;
      } else {
        isActive.value = false;
      }
    };

    onMounted(() => {
      if ([1, 3].includes(Number(props.type))) {
        uni.$on('CDropdownEvent', actionEvent);
      }
    });

    onBeforeMount(() => {
      const { title, type, list, value, width, name, extra } = props;
      addMenu({
        title,
        type,
        valueLabel: list.find(tmp => tmp.value === value)?.label || '',
        width,
        name,
        ...(extra || {}),
      });
    });

    const handleClickItem = (obj: any) => {
      const { title, type } = props;

      ctx.emit('update:value', obj.value);
      ctx.emit('onSelect', obj.value);

      /** 如果为列表, 更新label */
      if ([1].includes(Number(props.type))) {
        updateMenu(selfIndex.value, { title, type, valueLabel: obj.label });
      }

      isActive.value = false;
    };
    onBeforeUnmount(() => {
      uni.$off('CDropdownEvent', actionEvent);
    });

    return { setClassName, isActive, actionEvent, uiColor, handleClickItem };
  },
});
</script>
<style lang="scss">
.cc-dropdown-item {
  border-bottom-left-radius: 12rpx;
  border-bottom-right-radius: 12rpx;
  overflow: auto;
  max-height: 680rpx;
}
</style>
