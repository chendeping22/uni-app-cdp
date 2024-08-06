<template>
  <uni-list class="list-content">
    <uni-list-item title="高级设置" :border="false">
      <template #footer>
        <view class="expend" selectable="false" space="false" decode="false" @click="handleChange">
          <text class="expend-text" selectable="false" space="false" decode="false">
            {{ expendState ? '收起' : '展开' }}
          </text>
          <uni-icons :type="expendState ? 'arrowup' : 'arrowdown'" color="#4966F5" :size="20" />
        </view>
      </template>
    </uni-list-item>
    <template v-if="expendState">
      <uni-list-item
        title="打卡任务结束是否提醒"
        :show-switch="true"
        :border="false"
        :switch-checked="Boolean(value.enabledEndNotice)"
        @switchChange="change({ enabledEndNotice: +!value.enabledEndNotice })"
      ></uni-list-item>
      <uni-list-item
        title="是否允许学生互看打卡"
        :show-switch="true"
        :border="false"
        :switch-checked="Boolean(value.enabledView)"
        @switchChange="change({ enabledView: +!value.enabledView })"
      ></uni-list-item>
      <uni-list-item
        title="指定打卡方式"
        :right-text="typeName"
        show-arrow
        :border="false"
        clickable
        @click="link"
      ></uni-list-item>
      <uni-list-item
        title="是否提醒打卡"
        :show-switch="true"
        :border="false"
        :switch-checked="Boolean(value.enabledPreNotice)"
        @switchChange="change({ enabledPreNotice: +!value.enabledPreNotice })"
      ></uni-list-item>
      <picker
        v-if="Boolean(value.enabledPreNotice)"
        mode="time"
        :value="value.preNoticeTime"
        start="06:00"
        end="23:59"
        @change="({ detail: { value: time } }) => change({ preNoticeTime: time })"
      >
        <uni-list-item title="提醒打卡时间" show-arrow :border="false">
          <template #footer>
            <text class="gray-text" selectable="false" space="false" decode="false">
              {{ value.preNoticeTime }}
            </text>
          </template>
        </uni-list-item>
      </picker>
    </template>
  </uni-list>
</template>
<script lang="ts">
import uniListItem from '@/app-preprimary-education/components/uni-list-item/uni-list-item.vue';
import uniList from '@/app-preprimary-education/components/uni-list/uni-list.vue';
import { PropType, computed, defineComponent, onMounted, ref } from 'vue';

const typeHash = {
  0: '不限',
  1: '图片',
  2: '视频',
};

export default defineComponent({
  components: { uniList, uniListItem },
  props: {
    title: { type: String, default: '' },
    value: {
      type: Object as PropType<{
        enabledPreNotice: number;
        enabledView: number;
        enabledEndNotice: number;
        preNoticeTime: string;
        clockinWay: number[];
      }>,
      default: () => ({}),
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const expendState = ref(false);
    const handleChange = () => (expendState.value = !expendState.value);
    const typeName = computed(() => props.value.clockinWay.map(v => typeHash[v]).join(','));
    const change = data => {
      emit('change', { ...data });
    };
    const link = () => {
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/components/clock-in-type/index?selected=${props.value.clockinWay?.join(
          ',',
        )}`,
      });
    };

    onMounted(() => {
      uni.$on('clock-in-type', v => change({ clockinWay: v }));
    });

    return {
      expendState,
      handleChange,
      link,
      change,
      typeName,
    };
  },
});
</script>
<style scoped lang="scss">
@import '../../index.scss';
.expend {
  display: flex;
  align-items: center;
  color: $ui-color-primary;
  &-text {
    margin-right: $ui-gap-xs;
  }
}
</style>
