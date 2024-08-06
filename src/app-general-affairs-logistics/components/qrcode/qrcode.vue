<template>
  <view @longtap.stop="longtap">
    <canvas
      v-for="item in info.listCode"
      :id="item.id"
      :key="item.id"
      :width="info.destWidth"
      :height="info.destHeight"
      :canvas-id="item.id"
      :style="{ width: info.width, height: info.height }"
      @error="handleError"
    ></canvas>
  </view>
</template>
<script setup name="Qrcode">
import { defineExpose, getCurrentInstance, nextTick, onMounted, reactive, watch } from 'vue';
import { deepClone, getUUid, platform } from './helper.js';
import { GetImg, GetPixelRatio, GetPx, QRCode } from './index.js';
//定义props
const props = defineProps({
  options: {
    type: Object,
    required: true,
    default: () => {
      return {};
    },
  },
});
const emits = defineEmits(['generate', 'press', 'error']);
const opt = props.options;
const that = getCurrentInstance();
const SIZE = GetPx(opt.size);
let info = reactive({
  destHeight: SIZE * GetPixelRatio() + 'px',
  destWidth: SIZE * GetPixelRatio() + 'px',
  width: SIZE + 'px',
  height: SIZE + 'px',
  listCode: [],
  id: getUUid(),
});

onMounted(() => {
  SpecialTreatment(opt);
  nextTick(() => {
    generateCode(opt);
  });
});
watch(
  () => props.options,
  val => {
    SpecialTreatment(val);
    const SIZE_Dynamic = GetPx(val.size);
    (info.destWidth = GetPixelRatio() * SIZE_Dynamic + 'px'),
      (info.destHeight = GetPixelRatio() * SIZE_Dynamic + 'px'),
      (info.width = SIZE_Dynamic + 'px'),
      (info.height = SIZE_Dynamic + 'px'),
      setTimeout(() => {
        generateCode(val);
      }, 50);
  },
  { deep: true },
);
const SpecialTreatment = val => {
  //渲染多个canvas特殊处理
  let obj = deepClone(val);
  obj.id = info.id;
  info.listCode = [obj];
};
const generateCode = val => {
  try {
    const parameter = { ...val, source: platform(), id: info.id, ctx: that };
    QRCode(parameter, res => {
      emits('generate', res);
    });
  } catch (err) {
    console.warn(err);
  }
};
const GetCodeImg = async () => {
  try {
    return await GetImg({
      id: info.id,
      source: platform(),
      width: opt.width,
      height: opt.height,
      ctx: that,
    });
  } catch (e) {
    console.warn(e);
  }
};
// 长按事件
const longtap = e => {
  emits('press', e);
};
// canvas创建错误 触发
const handleError = e => {
  emits('error', e.detail);
};
defineExpose({
  GetCodeImg,
});
</script>
