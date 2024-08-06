<template>
  <CustomPage title="打卡方式" bg-type="clock-in" class="clock-in-type">
    <view class="type-list" hover-class="none" hover-stop-propagation="false">
      <view
        v-for="item in options"
        :key="item.value"
        class="type-item"
        hover-class="hover"
        hover-stop-propagation="false"
        @click="() => handleChange(item.value)"
      >
        {{ item.label }}
        <c-icon
          v-if="(uncontrollableValue.array)?.includes(
            item.value as any,
          )"
          name="icon_succeed"
          size="36"
          color-type="primary"
        />
      </view>
    </view>
    <u-button type="primary" class="submit-btn" @click="handleSubmit">确定</u-button>
  </CustomPage>
</template>
<script lang="ts">
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import { getPageParams } from '@/utils/tools';
import { PropType, defineComponent, onBeforeMount, reactive } from 'vue';

export default defineComponent({
  components: { CustomPage, ImpButton },
  props: {
    title: { type: String, default: '' },
    options: {
      type: Array as PropType<{ value: string | number; label: string }[]>,
      default: () => [
        { value: 0, label: '不限' },
        { value: 1, label: '必须上传图片' },
        { value: 2, label: '必须上传视频' },
      ],
    },
  },
  emits: [],
  setup() {
    const uncontrollableValue = reactive<{ array: any[] }>({ array: [] });

    const handleChange = (value: string | number) => {
      const asArray = uncontrollableValue.array;

      if (uncontrollableValue.array.includes(value)) {
        asArray?.splice(uncontrollableValue.array.indexOf(value), 1);
        if (asArray.length === 0) uncontrollableValue.array = [0];
        return;
      }
      if (value === 0) {
        uncontrollableValue.array = [0];
      } else {
        if (uncontrollableValue.array.indexOf(0) > -1)
          asArray?.splice(uncontrollableValue.array.indexOf(0), 1);
        asArray.push(value);
      }
    };

    const handleSubmit = () => {
      uni.$emit('clock-in-type', uncontrollableValue.array);

      uni.navigateBack({});
    };

    onBeforeMount(() => {
      const params = getPageParams();
      const data = params.selected?.split(',').map(v => +v) || [];
      uncontrollableValue.array = data;
    });

    return { uncontrollableValue, handleChange, handleSubmit };
  },
});
</script>
<style scoped lang="scss">
.clock-in-type {
  .type-list {
    padding-top: $ui-gap-default;
    width: 100%;

    .type-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 $ui-gap-large;
      line-height: 88rpx;
      background: $ui-color-white;
      overflow: hidden;
      .mark {
        display: none;
      }
      &:first-child {
        border-radius: $ui-radius-xl $ui-radius-xl 0 0;
      }
    }
  }
  .submit-btn {
    display: block;
    margin-top: 64rpx;
    padding: 0 32rpx;
  }
  ::v-deep {
    .page-body {
      background-color: $ui-color-fill-default;
    }
  }
}
</style>
