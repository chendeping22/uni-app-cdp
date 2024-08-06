<!-- eslint-disable vue/no-mutating-props -->
<template>
  <mt-card class-name="mt-b">
    <QuotaIndex :title="item.name" :index="index" />
    <view class="border-top border-line-default mtb-b"> </view>
    <c-radio-group
      v-model="item.inspectionTaskItemValue"
      class-name="flex-column-plain"
      @change="handleChangeRadio(item)"
    >
      <c-radio name="1">正常</c-radio>
      <c-radio name="2">异常</c-radio>
    </c-radio-group>
    <view class="radius-default plr-b ptb-s bg-fill-light">
      <!--体温-->
      <view v-if="item.type === 0" class="flex">
        <view class="flex-grow flex-inline h-52">
          <view class="flex-inline bg-white border border-line-default radius-default">
            <view
              :class="['w-52 flex-center', { 'color-disabled': !isEnableTemperate }]"
              @click="
                isEnableTemperate &&
                  $emit('update:temperature', (Number(temperature) - 0.1).toFixed(1))
              "
            >
              <text class="font-title">-</text>
            </view>
            <c-input
              v-model:value="item.temperature"
              type="digit"
              class-name="w-72 h-52 border-left border-right border-line-default"
              placeholder=""
              :show-clear="false"
              padding-clz=""
              :height-size="('none' as any)"
              font-size="desc"
              radius-type="none"
              :disabled="!isEnableTemperate"
              align="center"
            />
            <view
              :class="['w-52 flex-center', { 'color-disabled': !isEnableTemperate }]"
              @click="
                isEnableTemperate &&
                  $emit('update:temperature', (Number(temperature) + 0.1).toFixed(1))
              "
            >
              <text class="font-title">+</text>
            </view>
          </view>
          <view class="font-title ml-xxs">℃</view>
        </view>
        <!-- <c-button
          v-if="item.deviceFlag === 1"
          type="plain"
          height-size="button-xxs"
          @click="handleAsyncStudentTemp"
        >
          <text>同步设备体温</text>
        </c-button> -->
      </view>
      <!--其它-->
      <view v-else>
        <MtCheckboxTags
          v-model:selected="item.selected"
          :items="item.taskItemValues"
          label-map="abnormalValue"
          mutiple
        />
      </view>
    </view>
  </mt-card>
</template>
<script lang="ts">
import mtCard from '@/app-preprimary-education/components/mt-card/mt-card.vue';
import MtCheckboxTags from '@/app-preprimary-education/components/mt-checkbox-tags/mt-checkbox-tags.vue';
import QuotaIndex from '@/app-preprimary-education/everyday-task/components/quota-index/index.vue';
import { IInspectionConf } from '@/app-preprimary-education/services/health-day';
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';
export default defineComponent({
  components: { QuotaIndex, MtCheckboxTags, mtCard },
  props: {
    title: { type: String, default: '' },
    studentId: { type: String, default: '' },
    index: { type: Number, default: 1 },
    item: { type: Object as PropType<IInspectionConf>, default: () => {} },
    temperature: { type: String, default: '37.3' },
  },
  emits: ['update:temperature'],
  setup(props, ctx) {
    /** 强制温度可编辑, 当artificialityFlag为0且无法设备同步温度的时候，设为true */
    const forceEnabledTemperature = ref(false);

    /** 是否温度可编辑 */
    const isEnableTemperate = computed(() => {
      // return props.item.artificialityFlag === 1 || forceEnabledTemperature.value;
      return true;
    });
    /** 同步设备温度 */
    const handleAsyncStudentTemp = async () => {
      // const temperature = await getStudentTemp(props.studentId);
      const temperature = null;
      if (!temperature) {
        forceEnabledTemperature.value = true;
        // showInfo('未获取到学生体温数据，请手动输入');
      }
      ctx.emit('update:temperature', temperature || (37.0).toFixed(1));
    };

    const initTmp = () => {
      if (!props.item) return;
      const {
        item: { type, inspectionTaskItemValue, deviceFlag },
      } = props;
      // 重新检测时，若体温-异常-可设备获取，则调用接口获取最新的
      if (type === 0 && inspectionTaskItemValue === '2' && deviceFlag === 1) {
        handleAsyncStudentTemp();
      }
    };
    onBeforeMount(() => {
      initTmp;
    });

    const handleChangeRadio = (item: IInspectionConf) => {
      // if (item.type !== 0 || item.inspectionTaskItemValue === '1') return;
      if (item.type !== 0 || item.inspectionTaskItemValue === '1') {
        ctx.emit('update:temperature', (37.0).toFixed(1));
      }
      handleAsyncStudentTemp();
    };
    return { isEnableTemperate, handleAsyncStudentTemp, handleChangeRadio };
  },
});
</script>
