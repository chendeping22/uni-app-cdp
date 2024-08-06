<template>
  <u-popup v-model="show" mode="bottom" width="100%" safe-area-inset-bottom height="auto">
    <view class="u-select">
      <view class="u-select__header" @touchmove.stop.prevent="">
        <view
          class="u-select__header__cancel u-select__header__btn"
          hover-class="u-hover-class"
          :hover-stay-time="150"
          @tap="handleClose"
        >
          取消
        </view>
        <view class="u-select__header__title">修改截止时间 </view>
        <view
          class="u-select__header__confirm u-select__header__btn"
          hover-class="u-hover-class"
          style="color: #2979ff"
          :hover-stay-time="150"
          @touchmove.stop=""
          @tap.stop="handleSave"
        >
          保存
        </view>
      </view>
      <view class="u-select__body">
        <!-- <u-form ref="formRef" :model="formData" :error-type="['message']">
          <template v-for="(item, index) in items" :key="item.title">
            <u-form-item :label="item.title" :prop="`time${index}`" :required="!isDisabled(index)">
              <view class="flex"
                ><text class="time">请选择截止时间</text>
                <u-icon name="arrow-right" size="32" color="#00000073"></u-icon
              ></view>
            </u-form-item>
          </template>
        </u-form> -->
        <view v-for="(item, index) in items" :key="item.title" class="time-item-wrap">
          <view class="time-item flex-between" :class="{ disabled: isDisabled(index) }">
            <text><text v-if="!isDisabled(index)" class="required">*</text>{{ item.title }}</text>
            <view
              class="flex"
              @click="isDisabled(index) ? null : handleShowPicker(formData[index], index)"
              ><text class="time">{{ formData[index]?.format('YYYY-MM-DD HH:mm') }}</text>
              <u-icon name="arrow-right" size="32" color="#00000073"></u-icon></view
          ></view>
          <view v-if="isDisabled(index)" class="extra">非阶段内不可再修改截止时间</view>
        </view>
      </view>
    </view>
  </u-popup>
  <u-picker
    v-model="showPicker"
    mode="time"
    :params="{
      year: true,
      month: true,
      day: true,
      hour: true,
      minute: true,
      second: false,
    }"
    :step="30"
    :default-time="defaultTime"
    @confirm="handleConfirm"
  ></u-picker>
  <u-toast ref="toast" />
</template>

<script setup lang="ts">
import { modifyDeadline } from '@/app-teacher-personnel/topic/api/topicBatch';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { PropType, ref } from 'vue';

dayjs.extend(isSameOrAfter);

const props = defineProps({
  current: { type: Number, default: 0 },
  data: { type: Object as PropType<any> },
});

const emit = defineEmits(['submit']);
const formData = ref<any>({});
const toast = ref();

const isDisabled = (index: number) => index < props.current;

const items = [
  {
    title: '课题申报',
  },
  {
    title: '开题论证',
  },
  {
    title: '中期检查',
  },
  {
    title: '结题鉴定',
  },
];

const show = ref(false);
const showPicker = ref(false);
const currentClickIndex = ref(0);

const defaultTime = ref();

function handleShowPicker(val, index) {
  showPicker.value = true;
  currentClickIndex.value = index;
  defaultTime.value = val?.format('YYYY-MM-DD HH:mm:ss');
}
function handleClose() {
  show.value = false;
  formData.value = {};
}

function validCurrent() {
  let r = { failed: false };
  for (const key of Object.keys(formData.value)) {
    const value = formData.value[key];
    if (value && value?.isBefore(dayjs(), 'minute') && !isDisabled(key)) {
      const name = items[key]?.title;
      return { failed: true, msg: name + '不能早于当前时间' };
    }
  }

  return r;
}

const labels = ['课题申报', '开题论证', '中期检查', '结题鉴定'];

function validAfter() {
  let r = { failed: false };
  for (const index of Object.keys(formData.value)) {
    const value = formData.value[index];
    if (isDisabled(index)) {
      continue;
    }
    for (let i = 0; i < index; i++) {
      if (
        formData.value[i] &&
        (formData.value[i] as dayjs.Dayjs).isSameOrAfter(value, 'minute') &&
        !isDisabled(i)
      ) {
        return {
          failed: true,
          // msg: `${labels[index]}不能早于${labels.slice(0, index).join('、')}`,
          msg: `截止时间不能早于前一阶段的截止时间，请检查后重新填写！`,
        };
      }
    }
  }

  return r;
}

async function handleSave() {
  // console.log('🚀ccc ~  handleSave', formData.value);
  //修改时间
  const _validCurrent = validCurrent();
  if (_validCurrent.failed) {
    toast.value.show({
      title: _validCurrent.msg,
      type: 'default',
    });
    // uni.showToast({
    //   title: _validCurrent.msg,
    //   icon: 'none',
    //   mask: false,
    //   duration: 3000,
    // });
    return;
  }
  const _validAfter = validAfter();
  if (_validAfter.failed) {
    toast.value.show({
      title: _validAfter.msg,
      type: 'default',
    });
    // uni.showToast({
    //   title: _validAfter.msg,
    //   icon: 'none',
    //   mask: false,
    //   duration: 3000,
    // });
    return;
  }
  const _formatData = {};
  Object.keys(formData.value).forEach(key => {
    _formatData[key] = +formData.value[key];
  });
  let id = props.data.id;
  let params = {
    declareTopicDeadline: _formatData['0'],
    argumentDeadline: _formatData['1'],
    termCheckDeadline: _formatData['2'],
    authenticateDeadline: _formatData['3'],
  };
  await modifyDeadline(id, params);
  uni.showToast({
    title: '保存成功',
    icon: 'success',
  });

  emit('submit', _formatData);
  show.value = false;
}

function handleConfirm(e) {
  const { year, month, day, hour, minute } = e || {};
  const newDay = dayjs()
    .set('year', year)
    .set('month', month - 1)
    .set('date', day)
    .set('hour', hour)
    .set('minute', minute)
    .set('second', 0);
  const newDayStr = newDay?.format('YYYY-MM-DD HH:mm:ss');
  defaultTime.value = newDayStr;
  formData.value[currentClickIndex.value] = newDay;
}

defineExpose({
  open: () => {
    show.value = true;
    var meterials = props.data.materials;
    for (var i = 0; i < meterials.length; i++) {
      formData.value[i] = dayjs(meterials[i].deadline);
    }
  },
});
</script>

<style scoped lang="scss">
.u-select {
  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
    padding: 0 32rpx;
  }

  &__body {
    width: 100%;
    height: 500rpx;
    overflow: hidden;
    background-color: #fff;
    padding: 0 32rpx;

    .time-item-wrap {
      border-bottom: 1rpx solid #0000000f;
      height: 96rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .time-item {
      .time {
        color: rgba($color-text-base, 0.65);
        margin-right: 8rpx;
      }
      &.disabled {
        opacity: 0.45;
      }
      .required {
        color: $u-type-error;
      }
    }
    .extra {
      color: rgba($color-text-base, 0.45);
      @include caption-1-regular;
    }
  }
}
</style>
