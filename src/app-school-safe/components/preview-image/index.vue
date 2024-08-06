<template>
  <u-image
    :src="src"
    :mode="mode"
    class="w100 mtb-l"
    :class="className"
    :border-radius="8"
    :height="height"
    @click="() => previewImage(src)"
  >
    <template #error>
      <u-image :src="multimedia_image_error" :height="80" :width="80" />
    </template>
  </u-image>
</template>

<script lang="ts" setup>
import multimedia_image_error from '@/app-school-safe/static/image/multimedia_image_error.png';
import { showInfo } from '@/utils/tools';

interface IProps {
  className?: string;
  src: string;
  mode?:
    | 'scaleToFill' // 缩放,不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素
    | 'aspectFit' // 缩放,保持纵横比缩放图片，使图片的长边能完全显示出来。也就是说，可以完整地将图片显示出来。
    | 'aspectFill' // 缩放,保持纵横比缩放图片，只保证图片的短边能完全显示出来。也就是说，图片通常只在水平或垂直方向是完整的，另一个方向将会发生截取。
    | 'widthFix' // 缩放,宽度不变，高度自动变化，保持原图宽高比不变
    | 'heightFix' // 缩放,高度不变，宽度自动变化，保持原图宽高比不变 App 和 H5 平台 HBuilderX 2.9.3+ 支持、微信小程序需要基础库 2.10.3
    | 'top' // 裁剪,不缩放图片，只显示图片的顶部区域
    | 'bottom' // 裁剪,不缩放图片，只显示图片的底部区域
    | 'center' // 裁剪,不缩放图片，只显示图片的中间区域
    | 'left' // 裁剪,不缩放图片，只显示图片的左边区域
    | 'right' // 裁剪,不缩放图片，只显示图片的右边区域
    | 'top left' // 裁剪,不缩放图片，只显示图片的左上边区域
    | 'top right' // 裁剪,不缩放图片，只显示图片的右上边区域
    | 'bottom left' // 裁剪,不缩放图片，只显示图片的左下边区域
    | 'bottom right'; // 裁剪,不缩放图片，只显示图片的右下边区域
  height?: number;
}

withDefaults(defineProps<IProps>(), {
  className: '',
  mode: 'aspectFit',
  height: 240,
});

const previewImage = (image: string) => {
  if (!image) {
    showInfo('暂无图片');
    return;
  }
  uni.previewImage({ urls: [image] });
};
</script>

<style scoped lang="scss"></style>
