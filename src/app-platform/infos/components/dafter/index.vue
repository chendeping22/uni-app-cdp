<script setup lang="ts">
import htmlParser from '@/app-platform/infos/util/html-parser';
import { debounce, forEach, isObject, replace, values } from '@/utils/lodash-es';
import { chooseAndUploadImage } from '@/utils/upload-medias';
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue';

export interface NodeElement {
  name: string;
  attrs: { [key: string]: string };
  children?: NodeElement[];
}

const props = withDefaults(
  defineProps<{ modelValue?: string; text?: string; placeholder?: string; readonly?: boolean }>(),
  {
    readonly: false,
    placeholder: '请输入内容',
    modelValue: '',
    text: '',
  },
);
const emits = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'update:text', v: string): void;
}>();

const proxy = getCurrentInstance()?.proxy;
const editorCtx = ref();
const readOnly = ref(false);

async function handleUpload() {
  const params: any = values({
    medias: [],
    max: 1,
    showSuccess: true,
    useCompressUrl: false,
    isPublic: true,
    maxSize: 20,
    needThumbnail: false,
    sourceType: ['album', 'camera'],
    isFormDataReq: false,
    sizeType: ['compressed'],
  });

  uni.hideKeyboard();

  try {
    const sussImgs = await chooseAndUploadImage.apply(null, params);
    forEach(sussImgs, img => {
      const { url } = (isObject(img) ? img : { url: '' }) as any;
      const oEditorCtx = editorCtx.value;
      if (url && oEditorCtx) {
        oEditorCtx.insertImage({
          src: url,
          alt: '图片',
          fail(error: Error) {
            console.log('插入图片失败', error);
          },
        });
      }
    });
  } catch (error) {
    console.log('error', error);
    uni.showToast({
      icon: 'none',
      text: '插入图片失败',
    });
  }
}

function onEditorReady() {
  uni
    .createSelectorQuery()
    .in(proxy)
    .select('#editor')
    .context(res => {
      const ctx = res.context!;
      editorCtx.value = ctx;
    })
    .exec();
}

const handleInput = debounce(
  function handleInput(e: { detail: { html: string; text: string; delta: any } }) {
    const htmlContent = e.detail?.html;
    const newHtmlContent = wrapImgTagsWithP(htmlContent);
    const text = replace(e.detail?.text, /\n/g, '');
    emits('update:modelValue', newHtmlContent);
    emits('update:text', text);
  },
  300,
  { leading: true },
);

// 匹配<img>标签前不是“>”字符的所有<img>标签
function wrapImgTagsWithP(htmlContent: string): string {
  const precededImgPattern = /([^>])<img[^>]+>/gi;
  const imgPattern = /<img[^>]+>/i;

  function replaceWithP(match: string) {
    const pattern = /(.*)(<img[^>]+>)/i;
    if (imgPattern.test(match)) {
      return replace(match, pattern, '$1<p class="img">$2</p>');
    }
    return match;
  }

  const newHtmlContent = replace(htmlContent, precededImgPattern, replaceWithP);

  return newHtmlContent;
}

const nodes = computed(() => {
  if (props.readonly) {
    const ns = getNodes(htmlParser(props.modelValue));
    return ns;
  }
  return [];
});

function getNodes(trees: NodeElement[], updatedTrees: NodeElement[] = []) {
  if (trees.length === 0) {
    return updatedTrees;
  }

  const [current, ...rest] = trees;
  const clazz = current?.attrs?.class
    ? { class: 'p img-warp '.concat(current.attrs.class) }
    : { class: 'p' };

  const updatedCurrent: NodeElement = {
    ...current,
    attrs: {
      ...current.attrs,
      ...(current.name === 'p' ? clazz : {}),
      ...(current.name === 'img' ? { class: 'img-item' } : {}),
    },
    children: current.children ? getNodes(current.children, []) : undefined,
  };

  return getNodes(rest, [...updatedTrees, updatedCurrent]);
}

watch(
  () => props.modelValue && editorCtx.value,
  bool => {
    if (bool && !props.readonly) {
      readOnly.value = true;
      const ctx = editorCtx.value;
      ctx.setContents({
        html: props.modelValue,
        success() {
          nextTick(() => (readOnly.value = false));
          ctx.getContents({
            success({ text }) {
              emits('update:text', text);
            },
            fail(error: any) {
              console.log('获取内容失败', error);
            },
          });
        },
        fail(error: any) {
          console.log('初始化内容失败', error);
        },
      });
      return;
    }
  },
  { once: true },
);
</script>

<template>
  <view v-if="!readonly" class="wrap">
    <editor
      id="editor"
      :read-only="readOnly"
      :placeholder="placeholder"
      class="editor"
      @ready="onEditorReady"
      @input="handleInput"
    />
    <view class="upload">
      <view
        class="upload-item u-flex u-relative u-row-center"
        hover-class="u-add-wrap__hover"
        hover-stay-time="150"
        @click.stop="handleUpload"
      >
        <u-icon name="photo" class="u-add-btn" size="40" />
      </view>
    </view>
  </view>
  <view v-else class="dafter">
    <rich-text :nodes="nodes" />
  </view>
</template>

<style lang="scss" scoped>
.wrap {
  width: px2rpx(310px);
  overflow: hidden;

  .editor {
    @include callout-regular;
    height: px2rpx(146px);
    min-height: px2rpx(146px);

    ::before {
      font-style: normal;
      color: rgba($color-text-base, 0.45);
    }
  }

  .upload {
    padding-top: $space-size-base;
    &-item {
      width: px2rpx(32px);
      height: px2rpx(32px);
      overflow: hidden;
      background: $color-background-base;
      border-radius: $radius-sm;
      border: 1px solid $color-border;
    }
  }
}

.dafter {
  :deep(.p) {
    text-align: justify;
    padding: px2rpx(4px) 0;
    overflow-wrap: break-word;
    word-wrap: break-word;
    white-space: normal;
    @include callout-regular;
  }

  :deep(.img-warp) {
    margin: px2rpx(4px) 0;
    width: 100%;
  }

  :deep(.img-item) {
    border-radius: $radius_base;
    overflow: hidden;
    width: 100%;
  }
}
</style>
