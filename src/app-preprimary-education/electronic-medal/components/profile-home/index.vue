<template>
  <view :class="[className, 'plr-l ptb-s bg-white flex-between ']">
    <view>
      <view class="flex-inline" @click="showPicker = true">
        <text class="font-xt mr-s bold">{{ curClazz.title || '/' }}</text>
        <c-icon name="icon_arrow_down" :size="48" color-type="placeholder" />
      </view>
    </view>
    <view class="flex">
      <view class="mt-xxs flex color-secondary font-secondary">
        <text>学生数:</text>
        <text class="ml-xs">{{ students.length }}</text>
      </view>
    </view>
  </view>

  <ClazzPicker
    v-model:show="showPicker"
    v-model:value="curSelectClazz"
    @onLoadPicker="handleLoadPicker"
  />
</template>

<script lang="ts" setup>
import ClazzPicker, {
  IPicker,
} from '@/app-preprimary-education/electronic-medal/components/clazz-picker/index.vue';
import { useTimeImpression } from '@/app-preprimary-education/electronic-medal/utils/use-electronic-medal';
import { delay, showInfo } from '@/utils/tools';
import { ref, toRefs, watchEffect } from 'vue';

interface IProps {
  className?: string | string[];
}

const props = withDefaults(defineProps<IProps>(), {
  className: '',
});

const emits = defineEmits(['onLoadClazz']);

const store = useTimeImpression();

const showPicker = ref(false);
const { students } = toRefs(store.homePage);
const { curClazz } = toRefs(store);
const curSelectClazz = ref([] as { value: any; label?: string }[]);

/** 初始化默认班级 */
const handleLoadPicker = async (data: IPicker[]) => {
  if (!data.length) {
    showInfo('暂无可查看班级');
    await delay(2000);
    uni.navigateBack();
    return;
  }
  const col_1 = data[0];
  const col_2 = col_1.children[0];
  const col_3 = col_2.children[0];
  curSelectClazz.value = [
    { value: col_1.value, label: col_1.label },
    { value: col_2.value, label: col_2.label },
    { value: col_3.value, label: col_3.label },
  ];
};

/** 设置当前选中班级对象 */
watchEffect(() => {
  if (curSelectClazz.value.length > 0) {
    curClazz.value = {
      title: curSelectClazz.value[2].label || '',
      clazzId: curSelectClazz.value[2].value || '',
    };
    emits('onLoadClazz');
  }
});
</script>
<style lang="scss" scoped></style>
