<template>
  <view :class="[setClassName(), className, 'relative']" @touchmove.stop.prevent="() => {}">
    <!--标题栏-->
    <view :class="[setClassName('menu'), 'height-cell-default flex-around']">
      <view
        v-for="(item, inx) in menus.array"
        :key="`menu__${inx}`"
        :class="[setClassName('title-wrap'), 'flex-inline']"
        :style="{ 'max-width': item.width }"
        @click.stop="handleClickMenu(inx, item)"
      >
        <text
          :class="[
            setClassName('title'),
            'font-content mr-xs text-ellipse',
            { 'color-primary': activeInx === inx },
          ]"
        >
          {{ item.valueLabel || item.title }}
        </text>
        <!--文字右边箭头-->
        <view
          v-if="item.type === 1 || ([0, 3].includes(item.type) && showArrow)"
          class="flex-column"
        >
          <c-icon
            :name="
              activeInx === inx && repeatStatus === 1 ? 'icon_arrow_up_fill' : 'icon_arrow_expand'
            "
            :size="36"
            :class-name="[activeInx === inx ? 'color-primary' : 'color-placeholder']"
          />
        </view>
        <view v-if="item.type === 2" class="flex-column relative icon-56">
          <view class="mb-xxs absolute" style="top: 4px">
            <c-icon
              name="icon_arrow_up_fill"
              :size="28"
              :class-name="[
                activeInx === inx && repeatStatus === 2 ? 'color-primary' : 'color-placeholder',
              ]"
            />
          </view>
          <view class="absolute" style="bottom: 4px">
            <c-icon
              name="icon_arrow_expand"
              :size="28"
              :class-name="[
                activeInx === inx && repeatStatus === 1 ? 'color-primary' : 'color-placeholder',
              ]"
            />
          </view>
        </view>
        <!--type为4, 箭头保持不变 -->
        <view v-if="item.type === 4" class="flex-column">
          <c-icon
            name="icon_arrow_expand"
            :size="36"
            :class-name="[activeInx === inx ? 'color-primary' : 'color-placeholder']"
          />
        </view>
        <slot name="itemRight" :type="item.type" :repeatStatus="repeatStatus" />
      </view>
    </view>
    <!--内容区-->
    <view
      :class="[setClassName('body'), 'fix']"
      :style="{
        height: open && repeatStatus === 1 ? bodyHeight + 'px' : '0px',
        opacity: open && repeatStatus === 1 ? 1 : 0,
        transition: `opacity ${100 / 1000}s linear`,
        overflow: 'hidden',
      }"
      @click.stop="repeatStatus = 2"
    >
      <slot></slot>
    </view>
  </view>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, provide, reactive, ref } from 'vue';
import { useClassName } from '../../../hooks/use-class-name';
import { ICDropdownItem } from '../cc-dropdown-item/index.vue';

type IRepeatStatus = 0 | 1 | 2; // 0-未选, 1-第一次, 2-重复
/**
 * dropdown筛选组件
 * @summary 新组件, 原组件弃用
 * @description 适用于多条件的dropdown筛选组件. 点击时, 符合类型的选项会弹出下拉框面板, 主要用于筛选. 只有一个筛选条件时要注意其占用一行
 * @param className 样式类, 仅支持公共样式
 */
export default defineComponent({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'cc-dropdown', // 组件名必传
  props: {
    /** 覆盖该组件的样式类, 仅支持公共样式 */
    className: { type: [String, Array], default: '' },
    /** 仅c-dropdown-item的type为0或3时使用 */
    showArrow: { type: Boolean, default: false },
  },
  emits: ['onChange'],
  setup(props, ctx) {
    const setClassName = useClassName();
    const activeInx = ref(-1);
    const repeatStatus = ref<IRepeatStatus>(0);
    const bodyHeight = ref(0);
    const open = ref(false);
    const menus = reactive({
      array: [] as ICDropdownItem[],
    });
    const updateMenu = (
      inx: number,
      item: ICDropdownItem,
      ops: { repeatStatus: IRepeatStatus },
    ) => {
      Object.assign(menus.array[inx], item);
      activeInx.value = -1;
      if (!ops) return;
      const { repeatStatus: _repeatStatus } = ops;
      if (_repeatStatus !== undefined) {
        repeatStatus.value = _repeatStatus;
      }
    };
    const addMenu = (obj: ICDropdownItem) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        menus.array.push(obj);
      });
    };

    provide('dropdown-menu', {
      menus: menus.array,
      updateMenu,
      addMenu,
    });

    const handleClickMenu = (inx: number, extra: any) => {
      repeatStatus.value = activeInx.value !== inx ? 1 : repeatStatus.value === 2 ? 1 : 2;
      activeInx.value = inx;
      uni.$emit('CDropdownEvent', {
        curInx: inx,
        repeatStatus: repeatStatus.value,
      });

      const item = menus.array[inx];
      // 1和3会打开mask及内容
      open.value = [1, 3].includes(item.type);
      // 0和2会触发onChange事件
      // if ([0, 2].includes(item.type)) {
      //   ctx.emit('onChange', {
      //     inx,
      //     repeatStatus: repeatStatus.value,
      //     updateMenu,
      //   });
      // }
      ctx.emit('onChange', {
        inx,
        repeatStatus: repeatStatus.value,
        updateMenu,
        item,
      });
    };

    const getBodyHeight = () => {
      const instance = getCurrentInstance() as any;
      const sys: any = uni.getSystemInfoSync();
      uni
        .createSelectorQuery()
        .in(instance)
        .select('.cc-dropdown-menu')
        .boundingClientRect(() => {})
        .exec(((ret: any) => {
          // const obj = ret[0];
          bodyHeight.value = sys.windowHeight;
        }) as any);
    };

    /** 仅用于强制关闭 */
    const close = () => {
      repeatStatus.value = 2;
    };

    onMounted(() => {
      getBodyHeight();
    });
    return {
      setClassName,
      menus,
      open,
      bodyHeight,
      activeInx,
      repeatStatus,
      handleClickMenu,
      close,
    };
  },
});
</script>
<style lang="scss">
$Z_Index_Top: 9999999999;
$Z_Index_Normal: 999999;
$Z_Index_Low: 9;

@mixin fix_top($top: unset, $right: unset, $bottom: unset, $left: unset, $zindex: 0) {
  position: fixed;
  top: $top;
  right: $right;
  bottom: $bottom;
  left: $left;
  z-index: calc($Z_Index_Top + $zindex);
}

.cc-dropdown-body {
  @include fix_top();
  left: 0;
  right: 0;
  background-color: rgba(#000, $alpha: 0.4);
}
</style>
