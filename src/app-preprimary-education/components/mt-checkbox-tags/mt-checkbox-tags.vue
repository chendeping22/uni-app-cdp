<template>
  <view :class="className">
    <c-space-group v-if="mode === 'space'">
      <c-space-item v-for="item in items" :key="`exception_item_${item[idMap]}`">
        <view
          :class="[
            'radius-default border border-thick border-transparent',
            isSelected(item[idMap]) ? 'bg-primary color-white' : 'bg-white border-line-default',
          ]"
          @click="handleSelect(item)"
        >
          <view class="flex-center plr-b ptb-xxs">
            <text
              :class="[
                'font-content bold',
                isTextEqual(item[labelMap]) && !isSelected(item[idMap]) ? 'color-primary' : '',
              ]"
            >
              {{ item[labelMap] }}
            </text>
            <text
              v-if="item[descMap]"
              :class="['font-content bold ml-xxs ']"
              :style="`color: ${isSelected(item[idMap]) ? 'rgba(255,255,255, 0.8)' : '#86909C'}; `"
            >
              {{ item[descMap] }}
            </text>
          </view>
        </view>
      </c-space-item>
    </c-space-group>
    <c-row v-else>
      <c-col v-for="item in items" :key="`exception_item_${item[idMap]}`" :span="item.span || 12">
        <view
          :class="['radius-default border border-thick border-transparent', 
        selected.some((tmp:any) => tmp[idMap] == item[idMap]) ?'bg-primary color-white':'bg-white border-line-default' ]"
          @click="handleSelect(item)"
        >
          <view class="flex-center plr-b ptb-xxs">
            <text class="font-xt"> {{ item[labelMap] }} </text>
          </view>
        </view>
      </c-col>
    </c-row>
  </view>
</template>
<script lang="ts">
import { defineComponent, PropType, toRaw } from 'vue';

export default defineComponent({
  props: {
    className: { type: [String, Array], default: '' },
    /** 所有选项 */
    items: { type: Array as PropType<any[]>, default: () => [] },
    /** 已选中的对应列表, 要使用双向绑定v-model:selected */
    selected: { type: Array as PropType<any[]>, default: () => [] },
    /** id映射 */
    idMap: { type: String, default: 'id' },
    /** label映射 */
    labelMap: { type: String, default: 'label' },
    descMap: { type: String, default: 'desc' },
    matchText: { type: String, default: '' },
    mutiple: { type: Boolean, default: false },
    /** 布局模式, space或grid宫格模式, 后者需要自带span */
    mode: { type: String as PropType<'space' | 'grid'>, default: 'space' },
  },
  emits: ['update:selected', 'change'],
  setup(props, ctx) {
    const isTextEqual = (label: string) => {
      const { matchText } = props;
      return matchText?.length && matchText === label;
    };
    const isSelected = (id: string) => {
      const { selected, idMap } = props;
      return selected.some((tmp: any) => tmp[idMap] == id);
    };
    const handleSelect = (_item: any) => {
      const item = toRaw(_item);
      if (!props.mutiple) {
        ctx.emit('update:selected', [item]);
        ctx.emit('change', [item]);
        return;
      }
      const curs = JSON.parse(JSON.stringify(props.selected)) as any[];
      const inx = curs.findIndex(tmp => tmp[props.idMap] === item[props.idMap]);
      if (inx === -1) {
        curs.push(item);
      } else {
        curs.splice(inx, 1);
      }
      ctx.emit('update:selected', curs);
      ctx.emit('change', [item]);
    };

    return { handleSelect, isTextEqual, isSelected };
  },
});
</script>
