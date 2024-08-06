<template>
  <uni-list class="list-content">
    <uni-list-item
      v-if="!value.id"
      title="打卡开始时间"
      show-arrow
      :border="false"
      clickable
      @click="handleShow"
    >
      <template #footer>
        <text class="gray-text" selectable="false" space="false" decode="false">
          {{ startDate }}
        </text>
        <c-calendar
          v-model:open="show"
          v-model="startDate"
          mode="date"
          z-index="10000000"
          :min-date="dayjs().format('YYYY-MM-DD')"
          :max-date="dayjs().add(179, 'day').format('YYYY-MM-DD')"
          @change="handleSwitchDate"
        />
      </template>
    </uni-list-item>
    <uni-list-item v-else title="打卡开始时间" :show-arrow="false" :border="false">
      <template #footer>
        <text class="disabled-text" selectable="false" space="false" decode="false">
          {{ startDate }}
        </text>
      </template>
    </uni-list-item>
    <uni-list-item
      title="打卡周期"
      :right-text="`${value.cycle}天`"
      show-arrow
      :border="false"
      clickable
      @click="onChangeSelectionState"
    ></uni-list-item>
    <uni-list-item
      title="打卡频次"
      :show-arrow="!value.id"
      :border="false"
      :clickable="!value.id"
      @click="link"
    >
      <template #footer>
        <text
          :class="['gray-text', { 'disabled-text': value.id }]"
          selectable="false"
          space="false"
          decode="false"
        >
          {{
            value.rate?.length === 7
              ? '每天'
              : value.rate
                  ?.sort()
                  .map(v => weekHash[v])
                  .join(',')
          }}
        </text>
      </template>
    </uni-list-item>
    <uni-list-item
      title="是否允许补卡"
      :show-switch="true"
      :border="false"
      :switch-checked="Boolean(value.enabledRetry)"
      @switchChange="change({ enabledRetry: +!value.enabledRetry })"
    ></uni-list-item>
  </uni-list>
  <selection-cycle
    :visible="selectionVisible"
    :value="{
      key: value.cycle,
      value: value.endDate,
    }"
    :start-time="value.startDate"
    title="选择周期"
    @onCancel="onChangeSelectionState"
    @onOk="onOkSelection"
  />
</template>
<script lang="ts">
import uniListItem from '@/app-preprimary-education/components/uni-list-item/uni-list-item.vue';
import uniList from '@/app-preprimary-education/components/uni-list/uni-list.vue';
import dayjs from 'dayjs';
import { PropType, computed, defineComponent, onMounted, ref } from 'vue';
import selectionCycle from '../selection-cycle/index.vue';

const weekHash = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日',
};

export default defineComponent({
  components: {
    'selection-cycle': selectionCycle,
    uniListItem,
    uniList,
  },
  props: {
    title: { type: String, default: '' },
    value: {
      type: Object as PropType<{ startDate: number; rate: number[]; id?: string }>,
      default: () => ({}),
    },
  },
  emits: ['change'],
  setup(props: any, { emit }) {
    const selectionVisible = ref(false);
    const onChangeSelectionState = () => (selectionVisible.value = !selectionVisible.value);

    const startDate = computed(
      () => props.value.startDate && dayjs(props.value.startDate).format('YYYY-MM-DD'),
    );

    const show = ref(false);
    function handleShow() {
      show.value = true;
    }

    const change = data => {
      emit('change', { ...data });
    };

    const handleSwitchDate = (date: { result: string }) => {
      const v = date.result;
      const newDate = {
        startDate: +new Date(v),
        endDate: +new Date(v) + 1000 * 60 * 60 * 24 * props.value.cycle,
      };
      change(newDate);
    };

    const onOkSelection = v => {
      change({
        cycle: v.key,
        endDate: v.value,
      });
      onChangeSelectionState();
    };

    const link = () => {
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/components/clock-frequency/index?selected=${props.value.rate?.join(
          ',',
        )}`,
      });
    };

    onMounted(() => {
      uni.$on('clock-frequency', v => change({ rate: v }));
    });

    return {
      link,
      selectionVisible,
      onChangeSelectionState,
      onOkSelection,
      dayjs,
      change,
      weekHash,
      startDate,
      show,
      handleShow,
      handleSwitchDate,
    };
  },
});
</script>
<style scoped lang="scss">
@import '../../index.scss';
</style>
