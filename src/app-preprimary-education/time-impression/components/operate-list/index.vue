<template>
  <mt-card padding="plr-l" class-name="mlr-b mt-s">
    <view v-for="(item, inx) in list" :key="`list_${inx}`">
      <view class="h-88 flex-between" @click="$emit('onSelect1', item)">
        <view class="font-title">{{ item.label }}</view>
        <c-icon
          v-if="curSelects[0] === item.value"
          name="icon_succeed"
          color-type="primary"
          :size="48"
        />
      </view>
      <mt-card
        v-if="item.children.length && curSelects[0] === item.value"
        padding="plr-l"
        class-name="bg-fill-default"
      >
        <view v-for="(child, inx2) in item.children" :key="`child_${inx2}`">
          <view class="h-88 flex-between" @click="$emit('onSelect2', child)">
            <view class="font-title">{{ child.label }}</view>
            <c-icon
              v-if="curSelects[1] === child.value"
              name="icon_succeed"
              color-type="primary"
              :size="48"
            />
          </view>
          <view v-if="curSelects[1] === child.value" class="flex flex-top">
            <view class="flex-center icon-40 mr-s">
              <c-icon name="icon_state_warn_fill" color-type="warnning" :size="32" />
            </view>

            <view class="text mb-b">{{ child.desc }}</view>
          </view>
        </view>
      </mt-card>
      <view v-if="item.children.length && curSelects[0] === item.value" class="h-24 w100"></view>
    </view>
  </mt-card>
  <view class="h-64 w100"></view>
  <view class="mlr-b">
    <u-button type="primary" :disabled="disabled" @click="$emit('onConfirm')">确定</u-button>
  </view>
</template>

<script lang="ts" setup>
import mtCard from '../../../components/mt-card/mt-card.vue';

export interface IOperateList {
  label: string;
  value: number;
  desc?: string;
  children: IOperateList[];
}

interface IProps {
  list: IOperateList[];
  disabled: boolean;
  curSelects: number[];
}
withDefaults(defineProps<IProps>(), {
  list: () => [],
  disabled: false,
  curSelects: () => [1, 0],
});

defineEmits(['onConfirm', 'onSelect1', 'onSelect2']);
</script>
