<template>
  <view class="wrapper" :style="{ width: width + 'px', height: height + 'px' }">
    <image
      v-if="Boolean(canvasImageFile)"
      :src="canvasImageFile"
      style="width: 100%; height: 100%"
    ></image>
    <canvas
      v-else
      :id="canvasId"
      :canvas-id="canvasId"
      :width="width * 2"
      :height="height * 2"
      style="width: 100%; height: 100%"
      @error="canvasIdErrorCallback"
    ></canvas>
    <view class="center-content"><slot></slot></view>
  </view>
</template>

<script setup lang="ts">
import {
  ComponentInternalInstance,
  computed,
  getCurrentInstance,
  onMounted,
  ref,
  watch,
  withDefaults,
} from 'vue';

interface FormatData {
  radian: number;
  scale: number;
  color: string;
}

interface PropsDataObject {
  value: number;
  color: string;
}

const props = withDefaults(
  defineProps<{
    data: PropsData;
    color?: string[];
    width?: number;
    height?: number;
    borderWidth?: number;
  }>(),
  {
    width: 100,
    height: 100,
    borderWidth: 10,
  },
);

type PropsData = PropsDataObject[] | number[];

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const createCanvasId = () => {
  const t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const len = t.length;
  let id = '';
  for (let i = 0; i < 32; i++) {
    id += t.charAt(Math.floor(Math.random() * len));
  }
  return `chart-circle__${id}`;
};
const canvasImageFile = ref();
const canvasId = ref(createCanvasId());
const canvasContext = ref<UniApp.CanvasContext>();
const defaultColor = ref([
  'rgb(0, 110, 255)',
  'rgb(247, 123, 0)',
  'rgb(245, 72, 57)',
  'rgb(249, 186, 0)',
  'rgb(36, 178, 18)',
  'rgb(126, 211, 244)',
  'rgb(169, 105, 198)',
  'rgb(64, 178, 125)',
]);

const DOUBLE_PI = Math.PI * 2;
const StartAngle = Math.PI * 1.5;

const drawOptions = computed(() => ({
  centerX: props.width / 2,
  centerY: props.height / 2,
  radius: Math.min(props.width, props.height) / 2,
}));

function formatData(data: PropsData) {
  const total = data.reduce(
    (accumulator, current) => accumulator + (typeof current === 'number' ? current : current.value),
    0,
  );
  let result: {
    radian: number;
    scale: number;
    color: string;
  }[] = [];
  let radianStart = 0;

  data.forEach((option, index) => {
    const isObject = typeof option !== 'number';
    const value = isObject ? option.value : option;
    radianStart = radianStart + (value / total) * DOUBLE_PI;
    let radian = radianStart - ((value / total) * DOUBLE_PI) / 2;
    result.push({
      radian,
      scale: value / total,
      color: (isObject && option.color) || defaultColor.value[index],
    });
  });

  return result;
}

function drawDonuts(
  context: UniApp.CanvasContext,
  startAngle: number,
  endAngle: number,
  data: FormatData,
) {
  const opts = drawOptions.value;
  context.beginPath();
  context.arc(
    opts.centerX,
    opts.centerY,
    opts.radius - props.borderWidth / 2,
    startAngle,
    endAngle,
    false,
  );
  context.lineCap = 'round';
  context.setLineCap('round');
  context.lineWidth = props.borderWidth;
  context.setLineWidth(props.borderWidth);
  context.strokeStyle = data.color;
  context.setStrokeStyle(data.color);
  context.stroke();
  context.closePath();
}

function render() {
  // if (props.width) canvasWidth.value = props.width;
  // if (props.height) canvasHeight.value = props.height;
  // if (props.borderWidth) borderWidth.value = props.borderWidth;
  if (props.color) {
    props.color.forEach((str, index) => {
      if (str) {
        defaultColor.value[index] = str;
      }
    });
  }

  let context: UniApp.CanvasContext;
  if (canvasContext.value) {
    context = canvasContext.value;
  } else {
    context = uni.createCanvasContext(canvasId.value, proxy);
    canvasContext.value = context;
  }
  if (!context) return;

  context.clearRect(0, 0, props.width, props.height);

  const data = formatData(props.data);
  const len = data.length;

  let startAngle = StartAngle;
  let endAngle = StartAngle;

  for (let i = len - 1; i >= 0; i--) {
    startAngle = endAngle - data[i].scale * DOUBLE_PI;
    drawDonuts(context, startAngle, endAngle, data[i]);
    endAngle = startAngle;
  }

  endAngle = StartAngle;
  startAngle = endAngle - (data[len - 1].scale * DOUBLE_PI) / 5;
  drawDonuts(context, startAngle, endAngle, data[len - 1]);

  context.draw(true, () => {
    // #ifdef MP-WEIXIN|H5
    // 转为图片展示, 解决canvas多端兼容性问题
    uni.canvasToTempFilePath(
      {
        canvasId: canvasId.value,
        success: function (res) {
          // 在H5平台下，tempFilePath 为 base64
          canvasImageFile.value = res.tempFilePath;
        },
      },
      proxy,
    );
    // #endif
  });
}

function canvasIdErrorCallback() {
  console.debug('canvasIdErrorCallback', arguments);
}

watch(
  () => [props.data, props.color, props.width, props.height, props.borderWidth],
  () => {
    render();
  },
);

onMounted(() => {
  render();
});
</script>

<style scoped lang="scss">
.wrapper {
  position: relative;
}
.center-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
