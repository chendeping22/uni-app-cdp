<template>
  <view
    :class="['bg-white flex ptb-s plr-l', { 'border-top border-line-default': !isFirst }]"
    @click="$emit('click', item)"
  >
    <c-image
      :src="item.photoUrl"
      :width="88"
      :height="88"
      mode="aspectFit"
      icon-loading=""
      :has-border="item.photoUrl.startsWith('http')"
    />
    <view class="flex-grow ml-l">
      <view class="flex-inline">
        <text class="font-title"> {{ item.name }} </text>
        <c-icon v-if="item.gender === 2" name="icon_gender_female" size="32" color-type="error" />
        <c-icon v-else name="icon_male" size="32" color-type="primary" />
      </view>
      <view class="font-secondary color-placeholder">{{ item.desc }}</view>
    </view>

    <template v-if="item.isLeave">
      <text style="color: #ff9900">请假</text>
    </template>
    <template v-else>
      <c-tag-item
        text="正常"
        bg-type="success"
        :is-brand-color="isNormal"
        @click="$emit('click', item)"
      />
      <text style="width: 10px"></text>
      <c-tag-item
        text="异常"
        bg-type="error"
        :is-brand-color="!isNormal"
        @click="$emit('click', item)"
      />
    </template>
  </view>
</template>
<script lang="ts">
import { getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, ref } from 'vue';

interface IPageParams {
  inspectionTaskId: string;
  type: 1 | 2 | 3;
}

export default defineComponent({
  props: {
    item: { type: Object, default: () => {} },
    isFirst: { type: Boolean, default: false },
    isNormal: { type: Boolean, default: true },
  },
  emits: ['click'],
  setup() {
    const pageParams = ref({} as IPageParams);

    onBeforeMount(() => {
      const { inspectionTaskId, type } = getPageParams();
      pageParams.value = {
        inspectionTaskId,
        type,
      };
    });
    return {};
  },
});
</script>
