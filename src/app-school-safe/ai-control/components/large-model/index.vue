<template>
  <view class="container" @click="handleClick">
    <view v-if="status === LargeModelCode.PENDING" class="tag tag-warn">
      <u-icon name="clock" :size="26" />
      <span class="label">校验中</span>
    </view>
    <view v-else-if="status === LargeModelCode.ERROR" class="tag tag-error">
      <u-icon name="info-circle" :size="26" />
      <span class="label">校验失败</span>
    </view>
    <template v-else>
      <image v-if="status === LargeModelCode.SUCCESS" :src="icon_logo_blue" class="icon-48" />
      <image v-if="status === LargeModelCode.FAIL" :src="icon_logo_gray" class="icon-48" />
    </template>
    <u-modal
      v-model="showSwitchStatusModal"
      title="切换状态"
      :content="`确定将大模型校验状态切换为${
        status === LargeModelCode.SUCCESS ? '不通过' : '通过'
      }，该状态表示该事件${status === LargeModelCode.SUCCESS ? '为误报事件' : '识别无误'}。`"
      mask-close-able
      show-cancel-button
      show-confirm-button
      @confirm="handleUpdate"
    ></u-modal>
    <u-modal
      v-model="showTryAgainModal"
      title="校验失败"
      :content="failReason"
      mask-close-able
      show-cancel-button
      show-confirm-button
      confirm-text="重试"
      @confirm="handleTryAgain"
    ></u-modal>
  </view>
</template>

<script lang="ts" setup>
import { largeModelTryAgain, updateLargeModelResult } from '@/app-school-safe/services/ai-control';
import icon_logo_blue from '@/app-school-safe/static/svg/icon_logo_blue.svg';
import icon_logo_gray from '@/app-school-safe/static/svg/icon_logo_gray.svg';
import usePermissions from '@/hooks/use-permissions';
import { hasPermission } from '@/utils/permissions';
import { computed, ref, toRefs } from 'vue';
import { LargeModelCode } from '../../constants/LargeModelEnum';

interface IProps {
  id: string;
  status: LargeModelCode;
  failReason?: string;
  disabled?: boolean; // 是否禁止操作
}

const props = withDefaults(defineProps<IProps>(), {
  failReason: '',
  disabled: false,
});

const emits = defineEmits(['updateStatus']);

const { id, status, failReason, disabled } = toRefs(props);

const showSwitchStatusModal = ref(false); // 校验通过/失败切换弹窗
const showTryAgainModal = ref(false); // 重试弹窗

// 是否有大数据模式校验权限
const largeModelPermission = computed(() => {
  return hasPermission(
    usePermissions().value || [],
    'Security:monitor:XWBKRecord:largeModel:Mobile',
  );
});

const handleUpdate = () => {
  updateLargeModelResult(
    id.value,
    status.value === LargeModelCode.SUCCESS ? LargeModelCode.FAIL : LargeModelCode.SUCCESS,
  )
    .then(() => {
      uni.showToast({
        title: '操作成功',
        icon: 'none',
      });
      emits('updateStatus');
    })
    .catch(error => {
      uni.showToast({
        title: error?.desc || '操作失败',
        icon: 'none',
      });
    });
};

const handleTryAgain = () => {
  largeModelTryAgain(id.value)
    .then(() => {
      uni.showToast({
        title: '操作成功',
        icon: 'none',
      });
      emits('updateStatus');
    })
    .catch(error => {
      uni.showToast({
        title: error?.desc || '操作失败',
        icon: 'none',
      });
    });
};

const handleClick = () => {
  if (disabled.value || !largeModelPermission.value) return;
  if ([LargeModelCode.FAIL, LargeModelCode.SUCCESS].includes(status.value))
    showSwitchStatusModal.value = true;
  else if ([LargeModelCode.ERROR].includes(status.value)) showTryAgainModal.value = true;
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  align-items: center;
}

.tag {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-radius: $radius-base;
  padding: 0 $ui-gap-xs;
  font-size: $ui-font-size-secondary;
  border-radius: $ui-radius-default;
  column-gap: $ui-gap-xxs;
  &-warn {
    color: $color-error;
    background-color: $error-bg;
  }
  &-error {
    color: white;
    background-color: red;
  }
}
</style>
