<template>
  <view v-if="rules?.length > 0" class="common-card components-result-info">
    <text class="common-title">告警条件</text>
    <view v-for="item in rules" :key="item.label" class="common-item">
      <text class="common-label">{{ item?.label }}</text>
      <text class="common-value">{{ item?.value }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { isNil } from '@/utils/lodash-es';
import { computed, toRefs } from 'vue';
import { BehaviorMonitorEnum } from '../../constants/BehaviorMonitorEnum';
import { CrossDirectEnum } from '../../constants/CrossDirectEnum';
import {
  LingerDetectTargetEnum,
  LingerDetectTargetOpts,
} from '../../constants/LingerDetectTargetEnum';
import { MonitorTypeEnum } from '../../constants/MonitorTypeEnum';
import { WayTypeEnum } from '../../constants/WayTypeEnum';

interface IProps {
  detail: any;
}

const props = withDefaults(defineProps<IProps>(), {
  detail: () => {},
});

const { detail } = toRefs(props);

const crossDirectEnum = [
  { label: '进入区域时告警', value: CrossDirectEnum.IN },
  { label: '离开区域时告警', value: CrossDirectEnum.OUT },
];

const targetTypeEnum = [
  { label: '机动车', value: 0 },
  { label: '非机动车', value: 1 },
  { label: '人', value: 2 },
];

const getConditionValue = (propsName: string[]) => {
  const { conditionJson } = detail.value || {};
  const config: Record<string, string> = {
    crossDirect: 'markCrossDirect',
    percentage: 'markPercentage',
    threshold: 'markThreshold',
    time: 'markTime',
    pointMode: 'pointMode',
    targetSize: 'targetSize',
    targetType: 'targetType',
  };

  return propsName.map(item => {
    const propName = config[item];

    if (!conditionJson) return null;
    const source = typeof conditionJson === 'string' ? JSON.parse(conditionJson) : conditionJson;
    return source[propName];
  });
};

const getConfigValue = (propsName: string[]) => {
  const { configJson } = detail.value || {};
  return propsName.map(item => {
    if (!configJson) return null;
    const source = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
    return source[item];
  });
};

const getTargetSizeRange = (targetSize: any, defaultRange?: number[]) => {
  let range: number[] = [];
  if (![undefined, null, ''].includes(targetSize)) {
    if (Array.isArray(targetSize)) {
      range = targetSize;
    } else if (typeof targetSize === 'string') {
      range = targetSize.split(',').map((s: string) => +s);
    } else if (targetSize?.range) {
      range = targetSize.range;
    }
  }

  if (range?.length === 0 && defaultRange) {
    range = defaultRange;
  } else if (range?.length === 4) {
    const min = Math.floor(range[0] * range[1] * 100);
    const max = Math.floor(range[2] * range[3] * 100);
    range = [min, max];
  }

  return range;
};

/**
 * 批量规则，其中configJson为告警通用的配置，conditionJson为和设备关联的条件配置
 * @param codes
 */
const getRules = () => {
  const { typeCode, algorithmType } = detail.value || {};
  const config = {
    // 区域入侵
    [BehaviorMonitorEnum.AREA_INVASION]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '方向',
          render: () => {
            const [wayType] = getConfigValue(['wayType']);
            const [crossDirect] = getConditionValue(['crossDirect']);
            return wayType === WayTypeEnum.AREA
              ? crossDirectEnum.find(item => item.value === crossDirect)?.label ?? '/'
              : undefined;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
        {
          label: '检测目标',
          render: () => {
            const [wayType] = getConfigValue(['wayType']);

            const [pointMode, percentage] = getConditionValue(['pointMode', 'percentage']);

            const instance = LingerDetectTargetOpts.find(item => item.value === pointMode);

            if (!instance) return '/';

            let label = instance.label;
            if (wayType === WayTypeEnum.AREA && pointMode === LingerDetectTargetEnum.wherever) {
              label = percentage ? `占区域${percentage}%` : '/';
            }

            return `人形${label}`;
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '方向',
          render: () => {
            const [wayType] = getConfigValue(['wayType']);
            return wayType === WayTypeEnum.AREA ? '进入区域时告警' : undefined;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              if (isNil(end)) {
                return `${targetSize}%`;
              } else {
                return `${start}% ~ ${end}%`;
              }
            }
            return '/';
          },
        },
        {
          label: '检测目标',
          render: () => {
            const [wayType] = getConfigValue(['wayType']);

            if (wayType === WayTypeEnum.AREA) {
              const [targetType] = getConditionValue(['targetType']);

              if (isNil(targetType)) return '/';

              return targetTypeEnum.find(item => item.value === parseInt(targetType))?.label ?? '/';
            }

            return undefined;
          },
        },
      ],
    },
    // 定点徘徊
    [BehaviorMonitorEnum.LINGER_ABOUT]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '徘徊时长',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);

            return isNil(threshold) ? '/' : `${threshold}秒`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
        {
          label: '检测目标',
          render: () => {
            const [pointMode] = getConditionValue(['pointMode']);

            const instance = LingerDetectTargetOpts.find(item => item.value === pointMode);

            const label = instance?.label;

            return isNil(label) ? '/' : `人形${label}`;
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '徘徊时长',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);

            return isNil(threshold) ? '/' : `${threshold}秒`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
    // 人员拥堵
    [BehaviorMonitorEnum.PERSONNEL_CONGESTION]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '区域人数',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);
            return isNil(threshold) ? '/' : `超过${threshold}人`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '区域人数',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);
            return isNil(threshold) ? '/' : `超过${threshold}人`;
          },
        },
        {
          label: '持续时长',
          render: () => {
            {
              const [time] = getConditionValue(['time']);
              return isNil(time) ? '/' : `${time}秒`;
            }
          },
        },
      ],
    },
    // 通道堵塞
    [BehaviorMonitorEnum.CHANNEL_BLOCKAGE]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '拥堵面积',
          render: () => {
            const [percentage] = getConditionValue(['percentage']);
            return isNil(percentage) ? '/' : `${percentage}%`;
          },
        },
        {
          label: '堵塞时长',
          render: () => {
            const [time] = getConditionValue(['time']);
            return isNil(time) ? '/' : `${time}秒`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '区域比例',
          render: () => {
            const [percentage] = getConditionValue(['percentage']);
            return isNil(percentage) ? '/' : `${percentage}%`;
          },
        },
        {
          label: '堵塞时长',
          render: () => {
            const [time] = getConditionValue(['time']);
            return isNil(time) ? '/' : `${time}秒`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
    // 车辆违停
    [BehaviorMonitorEnum.ILLEGAL_STOP]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '违停时长',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);

            return isNil(threshold) ? '/' : `${threshold}秒`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '车辆类型',
          render: () => {
            const [targetType] = getConditionValue(['targetType']);
            return targetTypeEnum.find(item => item.value === parseInt(targetType))?.label ?? '/';
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
        {
          label: '持续时长',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);
            return isNil(threshold) ? '/' : `${threshold}秒`;
          },
        },
      ],
    },
    // 离岗告警
    [BehaviorMonitorEnum.LEAVE_WORKPLACE]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '区域人数',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);

            return isNil(threshold) ? '/' : `少于${threshold}人`;
          },
        },
        {
          label: '持续时长',
          render: () => {
            const [time] = getConditionValue(['time']);

            return isNil(time) ? '/' : `${time}分钟`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '区域人数',
          render: () => {
            const [threshold] = getConditionValue(['threshold']);

            return isNil(threshold) ? '/' : `少于${threshold}人`;
          },
        },
        {
          label: '持续时长',
          render: () => {
            const [time] = getConditionValue(['time']);
            return isNil(time) ? '/' : `${time}分钟`;
          },
        },
      ],
    },
    // 人员跌倒
    [BehaviorMonitorEnum.LIEDOWN_ALARM]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '跌倒时长',
          render: () => {
            const [time] = getConditionValue(['time']);

            return isNil(time) ? '/' : `${time}秒`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
        {
          label: '持续时长',
          render: () => {
            const [time] = getConditionValue(['time']);
            return isNil(time) ? '/' : `${time}秒`;
          },
        },
      ],
    },
    // 智能布控-疑似打架
    [BehaviorMonitorEnum.FIGHT_MONITOR]: {
      [MonitorTypeEnum.SMART]: [
        {
          label: '持续时长',
          render: () => {
            const [time] = getConditionValue(['time']);
            return isNil(time) ? '/' : `${time}秒`;
          },
        },
      ],
    },
    // AI布控-疑似打架
    [BehaviorMonitorEnum.VIOLENCE_DETECT]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '持续时长',
          render: () => {
            const [time] = getConditionValue(['time']);

            return isNil(time) ? '/' : `${time}秒`;
          },
        },
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
    // 攀爬检测
    [BehaviorMonitorEnum.CLIMBING_DETECTION]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
        {
          label: '检测目标',
          render: () => {
            const [wayType] = getConfigValue(['wayType']);

            const [pointMode, percentage] = getConditionValue(['pointMode', 'percentage']);

            const instance = LingerDetectTargetOpts.find(item => item.value === pointMode);

            if (!instance) return '/';

            let label = instance.label;
            if (wayType === WayTypeEnum.AREA && pointMode === LingerDetectTargetEnum.wherever) {
              label = percentage ? `占区域${percentage}%` : '/';
            }

            return `人形${label}`;
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
    // 翻墙检测
    [BehaviorMonitorEnum.OVER_WALL_DETECTION]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
        {
          label: '检测目标',
          render: () => {
            const [wayType] = getConfigValue(['wayType']);

            const [pointMode, percentage] = getConditionValue(['pointMode', 'percentage']);

            const instance = LingerDetectTargetOpts.find(item => item.value === pointMode);

            if (!instance) return '/';

            let label = instance.label;
            if (wayType === WayTypeEnum.AREA && pointMode === LingerDetectTargetEnum.wherever) {
              label = percentage ? `占区域${percentage}%` : '/';
            }

            return `人形${label}`;
          },
        },
      ],
      [MonitorTypeEnum.SMART]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
    // 吸烟检测
    [BehaviorMonitorEnum.SMOKING_ALARM]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
    // 奔跑检测
    [BehaviorMonitorEnum.RUNNING_DETECTION]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
    // 追逐检测
    [BehaviorMonitorEnum.CHASE_DETECTION]: {
      [MonitorTypeEnum.AI]: [
        {
          label: '目标大小',
          render: () => {
            const [targetSize] = getConditionValue(['targetSize']);
            if (targetSize) {
              const [start, end] = getTargetSizeRange(targetSize);
              return `${start}% ~ ${end}%`;
            }
            return '/';
          },
        },
      ],
    },
  };

  const currentRuleConfig = config[typeCode]?.[algorithmType] ?? [];

  return currentRuleConfig
    .map((item: { label: any; render: any }) => {
      const { label, render } = item;

      const value = render();

      return {
        label: label,
        value,
      };
    })
    .filter((item: { value: any }) => item.value);
};

const rules = computed(() => {
  return getRules();
});
</script>

<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
</style>
