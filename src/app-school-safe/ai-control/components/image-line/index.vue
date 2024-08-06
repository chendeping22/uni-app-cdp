<!-- 图片组件 -->
<template>
  <view class="image-line-container">
    <view @click="previewImage">
      <u-image
        id="image-box"
        :src="src"
        class="image"
        width="100%"
        height="100%"
        :class="className"
      >
        <template #error>
          <u-image :src="multimedia_image_error" :height="120" :width="120" class="image-error" />
        </template>
      </u-image>
      <image
        v-if="!roiDisabled"
        :src="roiInfoSrc"
        class="image"
        :class="[{ hidden: !isRoiInfoShow }, className]"
      />
      <canvas
        v-if="canvasWidth && canvasHeight"
        :id="canvasId"
        class="canvas-polygon"
        :canvas-id="canvasId"
        :style="'width: ' + canvasWidth + 'px; height: ' + canvasHeight + 'px;'"
      ></canvas>
    </view>
    <view v-if="!roiDisabled && isHasRoi" class="icon" :class="{ hidden: !isRoiInfoShow }">
      <image :src="people_scan" class="icon-btn" @click="toggle"></image>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { AlarmTypeEnum } from '@/app-school-safe/constants/AlarmTypeEnum';
import multimedia_image_error from '@/app-school-safe/static/image/multimedia_image_error.png';
import people_scan from '@/app-school-safe/static/svg/icon_people_scan.svg';
import { uGetDom } from '@/app-school-safe/utils';
import { isEmpty, sortBy } from '@/utils/lodash-es';
import { showInfo } from '@/utils/tools';
import { computed, getCurrentInstance, nextTick, onMounted, ref, toRefs } from 'vue';
import { BehaviorMonitorEnum } from '../../constants/BehaviorMonitorEnum';
import { CrossDirectEnum } from '../../constants/CrossDirectEnum';
import { PaintTypeEnum } from '../../constants/PaintTypeEnum';

const INIT_WIDTH = 640;

interface IProps {
  className: string;
  roi: any[];
  objectRoi: any[];
  disableRoi: any[];
  alarmType: string;
  src: string;
  crossDirect: CrossDirectEnum;
  roiDisabled: boolean;
  polygonDisabled: boolean;
  lineColors?: string[]; // 线颜色，多折线情况下与roi的数量保持一致
  defaultLineColor?: string; // 默认线颜色
  areaId?: number; // 触发的第几个识别区
  monitorType?: string; // 行为布控类型
}

const props = withDefaults(defineProps<IProps>(), {
  roi: () => [],
  objectRoi: () => [],
  disableRoi: () => [],
  roiDisabled: true,
  polygonDisabled: true,
  lineColors: () => ['red', 'purple'],
  defaultLineColor: '#FFBB00',
  areaId: 1,
  monitorType: '',
});

const {
  roi,
  alarmType,
  objectRoi,
  src,
  crossDirect,
  roiDisabled,
  polygonDisabled,
  lineColors,
  defaultLineColor,
  disableRoi,
  areaId,
  monitorType,
} = toRefs(props);
const { proxy, instance } = getCurrentInstance() as any;
const canvasId = ref(`${Math.random()}`); // 采用随机数作为id.canvasToTempFilePath 同一个id时不触发的情况
const canvasWidth = ref(0);
const canvasHeight = ref(0);

const roiInfoSrc = ref();
const isRoiInfoShow = ref(true);

const isHasRoi = computed(() => {
  return roi.value.length + objectRoi.value.length;
});

const toggle = () => {
  isRoiInfoShow.value = !isRoiInfoShow.value;
};

/**
 * 绘制类型 line:跨线 polygon:跨区 polyline:多折线
 */
const paintType = computed(() => {
  if (
    [BehaviorMonitorEnum.CLIMBING_DETECTION, BehaviorMonitorEnum.OVER_WALL_DETECTION].includes(
      monitorType.value as BehaviorMonitorEnum,
    )
  )
    return PaintTypeEnum.Polyline;
  return [CrossDirectEnum.CLOCKWISE, CrossDirectEnum.EASTERN, CrossDirectEnum.BOTH].includes(
    crossDirect.value,
  )
    ? PaintTypeEnum.LINE
    : PaintTypeEnum.Polygon;
});

/**
 * 弧度转角度
 */
const radianToAngle = (radian: number) => {
  return (180 / Math.PI) * radian;
};
/**
 * 角度转弧度
 */
const angleToRadian = (angle: number) => {
  return (angle * Math.PI) / 180;
};

/**
 * 画笔宽度
 */
const strokeLineWidth = computed(() => {
  let lineWidth = 2;
  if (canvasWidth.value) {
    return lineWidth * ((canvasWidth.value * 1.0) / INIT_WIDTH);
  }
  return lineWidth;
});

const drawRect = (
  ctx: UniApp.CanvasContext,
  x: number,
  y: number,
  rectW: number,
  rectH: number,
) => {
  ctx.strokeStyle = '#3A85FF';
  ctx.beginPath();
  ctx.rect(x, y, rectW, rectH);
  ctx.setLineWidth(strokeLineWidth.value);
  ctx.stroke();
  ctx.closePath();
  ctx.draw(true);
};

const drawPolygon = (
  ctx: UniApp.CanvasContext,
  paths: any[],
  name: string,
  fillColor: string,
  strokeColor: string,
  x: number,
  y: number,
) => {
  ctx.beginPath();
  paths.forEach((element: [any, any], index: number) => {
    const [x, y] = element;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.setFillStyle(fillColor);
  ctx.setStrokeStyle(strokeColor);
  ctx.fill();
  ctx.setLineWidth(strokeLineWidth.value);
  ctx.stroke();
  ctx.setFontSize(14);
  ctx.setTextAlign('center');
  ctx.setTextBaseline('middle');
  ctx.setFillStyle('#ffffff');
  ctx.fillText(name, x, y);
  ctx.draw(true);
};

/**
 * 获取不规则多边形重心点
 *
 * @param mPoints
 * @return
 */
const getCenterOfGravityPoint = (mPoints: string | any[]) => {
  let area = 0.0; // 多边形面积
  let Gx = 0.0,
    Gy = 0.0; // 重心的x、y
  for (let i = 1; i <= mPoints.length; i++) {
    let iLat = mPoints[i % mPoints.length][0];
    let iLng = mPoints[i % mPoints.length][1];
    let nextLat = mPoints[i - 1][0];
    let nextLng = mPoints[i - 1][1];
    let temp = (iLat * nextLng - iLng * nextLat) / 2.0;
    area += temp;
    Gx += (temp * (iLat + nextLat)) / 3.0;
    Gy += (temp * (iLng + nextLng)) / 3.0;
  }
  Gx = Gx / area;
  Gy = Gy / area;
  return { Gx, Gy };
};

const drawArraw = (
  ctx: {
    save: () => void;
    translate: (arg0: any, arg1: any) => void;
    rotate: (arg0: any) => void;
    beginPath: () => void;
    moveTo: (arg0: number, arg1: number) => void;
    lineTo: (arg0: number, arg1: number) => void;
    closePath: () => void;
    setFillStyle: (arg0: string) => void;
    fill: () => void;
    draw: (arg0: boolean) => void;
    restore: () => void;
  },
  centerX: number,
  centerY: number,
  radian: number,
  isDrawHeader: any,
) => {
  const lineWidth = strokeLineWidth.value;
  const lineLength = 7.5 * strokeLineWidth.value;
  const lineSigleWidth = lineWidth / 2;

  const arrowWidth = 10 * strokeLineWidth.value;
  const arrowLength = 10 * strokeLineWidth.value;
  const arrowSigleWidth = arrowWidth / 2;

  ctx.save();

  ctx.translate(centerX, centerY);
  ctx.rotate(radian);

  ctx.beginPath();
  ctx.moveTo(lineSigleWidth, 0);
  ctx.lineTo(lineSigleWidth, lineLength);
  if (isDrawHeader) {
    ctx.lineTo(arrowSigleWidth, lineLength);
    ctx.lineTo(0, lineLength + arrowLength);
    ctx.lineTo(-arrowSigleWidth, lineLength);
  } else {
    ctx.lineTo(lineSigleWidth, lineLength + arrowLength);
    ctx.lineTo(-lineSigleWidth, lineLength + arrowLength);
  }
  ctx.lineTo(-lineSigleWidth, lineLength);
  ctx.lineTo(-lineSigleWidth, 0);
  ctx.closePath();
  ctx.setFillStyle('#3A85FF');
  ctx.fill();
  ctx.draw(true);

  ctx.restore();
};

const drawCrossDirectArraw = (ctx: any, paths: [any, any]) => {
  const [startPoint, endPoint] = paths;

  const [x1, y1] = startPoint;
  const [x2, y2] = endPoint;

  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;

  //弧度
  const radian = Math.atan2(y1 - y2, x1 - x2);

  // 反向
  const angle = radianToAngle(radian);
  const reverseRadian = angleToRadian(angle - 180);

  const arrowConfig = {
    1: [true, false],
    2: [false, true],
    9: [true, true],
  };

  drawArraw(ctx, centerX, centerY, radian, arrowConfig[crossDirect.value][0]);
  drawArraw(ctx, centerX, centerY, reverseRadian, arrowConfig[crossDirect.value][1]);
};

const drawLine = (ctx: UniApp.CanvasContext, paths: any[], strokeStyle: string) => {
  ctx.beginPath();
  paths.forEach((element: [any, any], index: number) => {
    const [x, y] = element;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.setStrokeStyle(strokeStyle);
  ctx.stroke();
  ctx.draw(true);

  paintType.value === PaintTypeEnum.LINE && drawCrossDirectArraw(ctx, paths);
};

/**
 * 获取画框的真实大小和位置
 */
const getObjectRoi = () => {
  const tempRoiArr: number[][] = [];
  (objectRoi.value || []).forEach(v => {
    const { x, y, width: w, height: h } = v;
    if (alarmType.value === AlarmTypeEnum.BEHAVIOR) {
      tempRoiArr.push([
        (x - w / 2) * canvasWidth.value,
        (y - h / 2) * canvasHeight.value,
        w * canvasWidth.value,
        h * canvasHeight.value,
      ]);
    } else {
      tempRoiArr.push([x, y, w, h]);
    }
  });

  return tempRoiArr;
};

/**
 * 获取真实大小和位置
 */
const getRoiInfo = (roiData: any[]) => {
  if (isEmpty(roiData?.[0].points)) {
    // 对应的数据结构：[{x:1,y:1}]
    return [
      {
        id: 1,
        points: roiData.map(item => [item.x * canvasWidth.value, item.y * canvasHeight.value]),
      },
    ];
  } else {
    // 对应的数据结构：[{points:[{x:1,y:1}]}]
    return roiData.map((item: any, idx: number) => {
      return {
        id: idx + 1,
        points: item.points.map((jtem: { x: number; y: number }) => [
          jtem.x * canvasWidth.value,
          jtem.y * canvasHeight.value,
        ]),
      };
    });
  }
};

const drawCallback = () => {
  uni.canvasToTempFilePath(
    {
      canvasId: canvasId.value,
      success: res => {
        // 在H5平台下，tempFilePath 为 base64
        roiInfoSrc.value = res.tempFilePath;
      },
    },
    proxy,
  );
};

const draw = async () => {
  const context = uni.createCanvasContext(canvasId.value, proxy);
  const rectInfo = getObjectRoi();
  rectInfo.forEach(v => {
    const [x, y, w, h] = v;
    drawRect(context, x, y, w, h);
  });
  if (alarmType.value === AlarmTypeEnum.BEHAVIOR && !polygonDisabled.value) {
    const polygonInfo = getRoiInfo(roi.value);
    if (paintType.value === PaintTypeEnum.LINE) {
      drawLine(context, polygonInfo?.[0]?.points, defaultLineColor.value);
    } else if (paintType.value === PaintTypeEnum.Polygon) {
      const sortedPolygonList = sortBy(polygonInfo, item => item.id === areaId.value);
      sortedPolygonList.forEach(item => {
        const fillColor = 'rgba(0, 180, 42, 0.25)';
        const strokeColor = item.id === areaId.value ? '#00B42A' : 'rgba(0, 0, 0, 0)';
        const { Gx, Gy } = getCenterOfGravityPoint(item.points);
        drawPolygon(context, item.points, `识别区${item.id}`, fillColor, strokeColor, Gx, Gy);
      });
    } else if (paintType.value === PaintTypeEnum.Polyline) {
      polygonInfo.forEach((item: any, idx: number) => {
        drawLine(context, item.points, lineColors.value?.[idx]);
      });
    }

    if (disableRoi.value?.length) {
      const disablePolygonInfo = getRoiInfo(disableRoi.value);
      disablePolygonInfo.forEach(item => {
        const fillColor = 'rgba(245, 63, 63, 0.4)';
        const strokeColor = 'rgba(0, 0, 0, 0)';
        const { Gx, Gy } = getCenterOfGravityPoint(item.points);
        drawPolygon(context, item.points, `屏蔽区${item.id}`, fillColor, strokeColor, Gx, Gy);
      });
    }
  }

  setTimeout(() => {
    drawCallback();
  }, 200);
};

const previewImage = () => {
  if (!src.value) {
    showInfo('暂无图片');
    return;
  }
  uni.previewImage({ urls: [src.value] });
};

onMounted(async () => {
  if (roiDisabled.value) return;
  const imageBox = await uGetDom(instance, '#image-box');
  canvasWidth.value = imageBox.width;
  canvasHeight.value = imageBox.height;
  if (alarmType.value === AlarmTypeEnum.BEHAVIOR) {
    nextTick(() => {
      draw();
    });
  } else {
    // 人员布控的人脸框坐标是相对于原始图片大小
    // ios上canvas的大小不能过大，会导致绘制信息丢失
    uni.getImageInfo({
      src: src.value,
      success: image => {
        const { width = 0, height = 0 } = image;
        if (!width || !height) return;
        const widthRatio = canvasWidth.value / width;
        const heightRatio = canvasHeight.value / height;
        const scaleRatio = Math.min(widthRatio, heightRatio);
        Object.assign(
          objectRoi.value,
          objectRoi.value.map(item => {
            const { x, y, width: w, height: h } = item;
            // image组件默认为scaleToFill模式，此处根据缩放比例处理，人形框保证方型
            return {
              x: x * widthRatio,
              y: y * heightRatio,
              width: w * scaleRatio,
              height: h * scaleRatio,
            };
          }),
        );
        nextTick(() => {
          draw();
        });
      },
    });
  }
});
</script>

<style lang="scss" scoped>
.image-line-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .icon {
    position: absolute;
    right: 24rpx;
    bottom: 24rpx;
    width: 72rpx;
    height: 72rpx;
    background: $ui-color-primary;
    z-index: 3;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon-btn {
      width: 44rpx;
      height: 44rpx;
    }

    &.hidden {
      background: $ui-color-disabled;
    }
  }

  .canvas-polygon {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
  }
}

.image {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  .image-error {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  &.hidden {
    opacity: 0;
  }
}
</style>
