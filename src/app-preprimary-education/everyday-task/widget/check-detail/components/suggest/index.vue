<template>
  <mt-card class-name="mt-b">
    <c-header title="留园建议" />
    <MtCheckboxTags
      :selected="[{ id: leaveSuggestion }]"
      mode="grid"
      :items="items"
      class-name="mt-b"
      @change="$emit('update:leaveSuggestion', $event[0].id)"
    />
    <view class="bg-fill-default p-all-b mt-b radius-default">
      <c-input
        :value="comment"
        type="textarea"
        :maxlength="50"
        bg-type="fill-default"
        placeholder="请输入备注内容"
        padding-clz=""
        :cursor-spacing="cursorSpacing"
        height="200rpx"
        @input="$emit('update:comment', $event)"
      />
      <view class="flex flex-right">
        <text class="font-secondary color-placeholder"> {{ comment?.length ?? 0 }}/50</text>
      </view>
    </view>
  </mt-card>
</template>
<script lang="ts">
import mtCard from '@/app-preprimary-education/components/mt-card/mt-card.vue';
import MtCheckboxTags from '@/app-preprimary-education/components/mt-checkbox-tags/mt-checkbox-tags.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  components: { MtCheckboxTags, mtCard },
  props: {
    leaveSuggestion: { type: Number, default: 1 },
    comment: { type: String, default: '' },
  },
  emits: ['update:comment', 'update:leaveSuggestion'],
  setup() {
    const items = [
      {
        id: 1,
        label: '留园',
        span: 12,
      },
      {
        id: 2,
        label: '离园',
        span: 12,
      },
    ];

    const cursorSpacing = uni.upx2px(240);

    return { items, cursorSpacing };
  },
});
</script>
