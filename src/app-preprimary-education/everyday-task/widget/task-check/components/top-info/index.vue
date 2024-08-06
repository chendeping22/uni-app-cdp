<template>
  <c-row class-name="bg-white">
    <c-col v-for="(item, inx) in list" :key="`top_info_${inx}`" span="8">
      <view class="flex-center" @click="$emit('update:curTab', inx)">
        <view
          :class="[
            'flex-column ptb-s',
            {
              'border-bottom border-thick border-primary': curTab === inx,
            },
          ]"
        >
          <text :class="['font-xt bold', curTab === inx ? 'color-primary' : 'color-base']">
            {{ item.value ?? 0 }}
          </text>
          <text :class="['font-secondary', curTab === inx ? 'color-primary' : 'color-placeholder']">
            {{ item.title }}
          </text>
        </view>
      </view>
    </c-col>
  </c-row>
</template>
<script lang="ts">
import { useStore } from '@/store/old';
import { computed, defineComponent } from 'vue';
export default defineComponent({
  props: {
    title: { type: String, default: '' },
    curTab: { type: Number, default: 0 },
  },
  emits: ['update:curTab'],
  setup() {
    const {
      state: { dailyHealth },
    } = useStore();

    const list = computed(() => {
      const { students } = dailyHealth;
      /** 已检与未检的统计 */
      const needCheck = students.length || 0;
      const readyCheck = students.filter(item => [1, 2].includes(item.healthStatus)).length || 0;
      return [
        {
          title: '应检人数',
          value: needCheck,
        },
        {
          title: '已检人数',
          value: readyCheck,
        },
        {
          title: '未检人数',
          value: needCheck - readyCheck,
        },
      ];
    });
    return { list };
  },
});
</script>
