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
      :has-border="item.photoUrl?.startsWith('http')"
    />
    <view class="flex-grow ml-l">
      <view class="flex-inline">
        <text class="font-title"> {{ item.name }} </text>
        <c-icon v-if="item.gender === 2" name="icon_gender_female" size="32" color-type="error" />
        <c-icon v-else name="icon_male" size="32" color-type="primary" />
      </view>
      <view class="font-secondary color-placeholder">{{ item.desc }}</view>
    </view>

    <template v-if="item.isLeave && ![1, 2].includes(item.healthStatus)">
      <text style="color: #ff9900">请假</text>
    </template>
    <template v-else>
      <c-tag-item
        v-if="[1, 2].includes(item.healthStatus)"
        :text="['', '正常', '异常'][item.healthStatus]"
        :bg-type="(['', 'success', 'error'][item.healthStatus] as any)"
      />
      <c-tag-item v-else :is-brand-color="false" text="未检测" />
    </template>
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    item: { type: Object, default: () => {} },
    isFirst: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup() {
    return {};
  },
});
</script>
