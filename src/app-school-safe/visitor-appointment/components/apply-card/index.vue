<template>
  <view class="plr-l mb-b">
    <view v-if="showGroupTag" class="font-content color-placeholder bold mtb-s">
      {{
        dayjs(visitBeginTime).format(
          `${dayjs(visitBeginTime).isSame(dayjs(), 'year') ? '' : 'YYYY-'}MM-DD 周dd`,
        )
      }}
    </view>
    <c-card @click="handleClick">
      <view class="flex flex-between">
        <view class="flex">
          <view class="font-xt color-base bold lh-6">{{ name || '/' }}</view>
          <view v-if="visitorNumber > 1" class="color-secondary font-content ml-s">
            ({{ visitorNumber }}人)
          </view>
        </view>

        <c-tag-item
          v-if="statusItem"
          :text="statusItem.label"
          :bg-type="statusItem.bgType"
          :color-type="statusItem.colorType"
          font-type="content"
        />
      </view>
      <view class="font-secondary color-placeholder lh-6">
        提交于 {{ dayjs(submitTime).format('YYYY-MM-DD HH:mm:ss') }}
      </view>
      <view class="mt-xxs flex">
        <view class="w-120 font-content color-placeholder mr-s">拜访时间</view>
        <view class="font-content color-secondary">
          {{ dayjs(visitBeginTime).format('HH:mm') }}～{{ dayjs(visitEndTime).format('HH:mm') }}
        </view>
      </view>
    </c-card>
  </view>
</template>
<script lang="ts" setup>
import { EApplicationType, ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { isNil } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { computed, toRefs } from 'vue';
import { visitStatusEnum } from '../../constants';

dayjs.locale('zh');

interface IProps {
  id: string;
  name?: string;
  submitTime?: number;
  visitBeginTime?: number;
  visitEndTime?: number;
  showStatus?: boolean;
  status?: number;
  showGroupTag?: boolean;
  visitorNumber?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: undefined,
  submitTime: undefined,
  visitBeginTime: undefined,
  visitEndTime: undefined,
  showStatus: false,
  status: undefined,
  showGroupTag: false,
  visitorNumber: 0,
});

const { showStatus, status } = toRefs(props);

const statusItem = computed(() => {
  if (showStatus.value && !isNil(status.value)) {
    return visitStatusEnum.find(item => item.value === status.value);
  }
  return null;
});

const handleClick = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/subPackages/visitor-appointment/info/apply-info?id=${props.id}`,
    EApplicationType.Old,
  );
};
</script>

<style scoped lang="scss" />
