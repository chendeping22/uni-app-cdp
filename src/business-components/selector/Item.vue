<script setup lang="ts">
import {
  PersonItemLevelEnum,
  SelectorTypeEnum,
  StudentItemLevelEnum,
} from '@/components/selector/types';
import icon_organization from '@/static/icon_organization.svg';
import { computed } from 'vue';
import icon_userGroup from './static/UserGroup.svg';
import { EntityType, Layered } from './types';
import icon_avatar from '/static/avatar.png';

const props = defineProps<{
  node: Layered;
  disabled?: boolean;
  disabledIcon?: boolean;
  selected?: boolean;
  checkable?: boolean;
  /** 选择器类型 */
  selectorType?: SelectorTypeEnum;
  selectedType?: 'multiple' | 'single';
  entityType?: EntityType;
  descriptionPrefix?: '';
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'check', node: Layered): void;
  (e: 'click', node: Layered): void;
  (e: 'drill', node: Layered): void;
}>();

const isShowDill = computed(
  () =>
    props.node.children?.length ||
    props.node.subChildren?.length ||
    (((props.entityType === 'person' && props.node.level === PersonItemLevelEnum.location) ||
      (props.entityType === 'student' && props.node.level === StudentItemLevelEnum.location)) &&
      !props.node.hasFetched),
);

const drillEnable = computed(() => {
  /**
   * 1. 空间选择器也可以下钻
   * 2. 单选选中时也可以下钻
   * 3. 职位选择器没有下钻
   */
  if (props.selectorType === SelectorTypeEnum.space) {
    return true;
  } else if (props.selectorType === SelectorTypeEnum.position) {
    return false;
  }
  if (props.selected && props.selectedType !== 'single') {
    return false;
  }
  if (props.disabled) {
    return false;
  }
  return true;
});

const onCheck = () => {
  if (!props.node.isFetching && !props.disabled) {
    emit('check', props.node);
  }
};

const onClick = () => {
  if (drillEnable.value) {
    emit('drill', props.node);
  } else if (!props.node.isFetching && !props.disabled) {
    emit('check', props.node);
  }
};

const onDrill = () => {
  if (drillEnable.value) {
    emit('drill', props.node);
  }
};

const isUser = computed(() => {
  return (
    (props.entityType === 'person' && props.node.level === PersonItemLevelEnum.user) ||
    (props.entityType === 'student' && props.node.level === StudentItemLevelEnum.student)
  );
});

const description = computed(() => {
  if (!isUser.value) {
    return '';
  }

  let _desc =
    props.entityType === 'student' ? props.node.identifier || '' : props.node.position || '';

  _desc = `${props.descriptionPrefix || ''}${props.descriptionPrefix && _desc ? '-' : ''}${_desc}`;

  return _desc ? `（${_desc}）` : '';
});
</script>

<template>
  <u-cell-item
    :arrow="false"
    :icon-style="{ opacity: disabled ? 0.5 : 1 }"
    :title-style="{ opacity: disabled ? 0.5 : 1 }"
    :label-style="{ opacity: disabled ? 0.5 : 1 }"
    :value-style="{ opacity: disabled ? 0.5 : 1 }"
    @click="onClick"
  >
    <template #icon>
      <slot name="checkbox">
        <view
          v-if="checkable"
          class="item-checkbox"
          :style="{
            backgroundColor: selected ? '#176bfb' : '#fff',
            borderColor: selected ? '#176bfb' : '#c8c9cc',
            opacity: disabled ? 0.5 : 1,
          }"
          @click.stop="onCheck"
        >
          <u-icon name="checkbox-mark" color="#fff" size="20"></u-icon>
        </view>
      </slot>
    </template>
    <template #title>
      <view class="item-title">
        <template v-if="disabledIcon"></template>
        <image
          v-else-if="isUser"
          class="item-avatar"
          :src="`${node.avatar || icon_avatar}`"
          mode="aspectFill"
        />
        <view v-else-if="entityType === 'role'" class="item-icon">
          <image class="icon-img" :src="icon_userGroup" mode="aspectFit" />
        </view>
        <view v-else class="item-icon">
          <image class="icon-img" :src="icon_organization" mode="aspectFit" />
        </view>
        <text class="item-name body-regular">
          {{ props.title || node.name }}
          <text v-if="description" class="item-desc">{{ description }}</text>
        </text>
      </view>
    </template>
    <template #right-icon>
      <slot name="right-icon">
        <view v-if="node.isFetching">
          <u-loading mode="circle"></u-loading>
        </view>
        <view v-else-if="isShowDill" class="arrow-drill" @click.stop="onDrill">
          <u-icon
            name="arrow-right"
            color="#666"
            :style="{ opacity: drillEnable ? 1 : 0.3 }"
          ></u-icon>
        </view>
      </slot>
    </template>
  </u-cell-item>
</template>

<style lang="scss" scoped>
.item-title {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.88);
}

.item-name {
  flex: 1;
}

.item-desc {
  color: #999;
}

.item-icon,
.item-avatar {
  width: 64rpx;
  height: 64rpx;
  margin-left: -8rpx;
  margin-right: 16rpx;
  border-radius: 50%;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
  border: 1px solid #eee;
}

.icon-img {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.6;
}

.item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 36rpx;
  border: 1px solid #c8c9cc;
  border-radius: 50%;
}

.arrow-drill {
  position: relative;
  &::after {
    content: ' ';
    display: inline-block;
    position: absolute;
    width: 48px;
    height: 48px;
    margin-top: -24px;
    margin-left: -24px;
    top: 50%;
    left: 50%;
  }
}
</style>
