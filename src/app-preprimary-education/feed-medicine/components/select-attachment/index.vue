<template>
  <c-cell-group :border="false">
    <c-cell-item placeholder="" :arrow="false" :class="[required ? 'label-require' : '']">
      <template #title>
        <view class="u-cell_title">
          <text>{{ title }}</text>
          <text v-if="required" class="item-require">*</text>
          <text v-if="subTitle" class="sub-title">{{ subTitle }}</text>
        </view>
      </template>
      <template #rightIcon>
        <c-icon
          v-if="attachments.length < 10"
          name="icon_picture"
          size="48"
          @click="handlePicture"
        />
      </template>
    </c-cell-item>
    <view style="padding-top: 24rpx">
      <c-images :list="attachments" type="mini" :editable="true" @update:list="changeImgs" />
    </view>
  </c-cell-group>
</template>
<script lang="ts">
import { showInfo } from '@/utils/tools';
import { batchUploadChoosedImages, chooseImage } from '@/utils/upload-medias';
import { PropType, defineComponent, ref, watchEffect } from 'vue';
type attachmentType = { fileId: string; url: string };
export default defineComponent({
  components: {},
  props: {
    title: { type: String, default: '图片' },
    required: { type: Boolean, default: false },
    subTitle: { type: String, default: '' },
    dataList: {
      type: Array as PropType<Array<attachmentType>>,
      default: () => [],
    },
  },
  emits: ['changeData'],
  setup(props, { emit }) {
    const attachments = ref<Array<attachmentType>>([]);
    //watch props.dataList 的变化
    // watch(
    //   () => [...props.dataList],
    //   (newVal, oldVal) => {
    //     debugger;
    //     attachments.value = JSON.parse(JSON.stringify(newVal));
    //     console.log('22222', attachments.value);
    //   },
    //   {
    //     deep: true,
    //   },
    // );

    /**
     * 选择文件
     */
    const chooseFiles = async (max: number) => {
      const curCount = attachments.value.length;
      console.log('curCount--', curCount);
      if (curCount >= max) {
        showInfo(`最多上传${max}张图片`);
        return [];
      }
      const files = await chooseImage({
        count: max - curCount,
        maxSize: 1024 * 1024, // 设置较大的值，不限制用户上传大小
      });
      if (curCount + files.length > max) {
        showInfo(`最多选择${max - curCount}张图片`);
        return [];
      }
      return files;
    };

    /**
     * 上传附件
     */
    const handlePicture = async () => {
      const choosedImages = await chooseFiles(10);
      const uploadedImages = await batchUploadChoosedImages(choosedImages, true, true, true);
      attachments.value.push(...uploadedImages);
      emit('changeData', attachments.value);
    };
    const changeImgs = (imgs: Array<attachmentType>) => {
      attachments.value = imgs;
      emit('changeData', attachments.value);
    };
    watchEffect(() => {
      attachments.value = JSON.parse(JSON.stringify(props.dataList));
    });
    const resetDatas = (val: Array<attachmentType>) => {
      attachments.value = JSON.parse(JSON.stringify(val));
    };

    return {
      attachments,
      handlePicture,
      changeImgs,
      resetDatas,
    };
  },
});
</script>
<style lang="scss" scoped>
.label-require {
  ::v-deep {
    .u-cell_title {
      display: flex;
    }
    // .u-cell_title::after {
    //   content: '*';
    //   display: inline;
    //   color: red;
    //   margin-left: $ui-gap-xxs;
    //   font-size: $ui-font-size-title;
    // }
  }
}
.sub-title {
  font-size: $ui-font-size-secondary;
  color: $ui-color-placeholder;
}

.item-require {
  color: $ui-color-error;
}
</style>
