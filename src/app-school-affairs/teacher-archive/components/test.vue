<template>
  <view class="teacher-archive-parse">
    <view class="parse-body">
      <view class="parse-block parse-block--common">
        <u-form ref="form1" :model="form" :label-style="{}">
          <u-form-item label="姓名" prop="name"
            ><u-input v-model="form.name" input-align="right" clearable disabled
          /></u-form-item>
          <u-form-item label="input number" prop="name11" :required="true"
            ><u-input
              v-model="form.name11"
              input-align="right"
              type="number"
              clearable
              :disabled="false"
          /></u-form-item>
          <u-form-item label="textarea" prop="name1" class="textarea-form-item"
            ><u-input v-model="form.name1" type="textarea" input-align="right"
          /></u-form-item>
          <u-form-item label="生日" prop="birthday"
            ><u-input
              v-model="form.birthday"
              type="select"
              input-align="right"
              @click="calendar1.show = true"
            />
            <u-calendar v-model="calendar1.show" mode="date"></u-calendar>
          </u-form-item>
          <!-- <u-form-item label="年" prop="year">
            <u-input
              v-model="form.year"
              type="select"
              input-align="right"
              @click="showYear = true"
            />
            <u-picker
              v-model="showYear"
              mode="time"
              :params="{
                year: true,
                month: true,
                day: true,
                hour: false,
                minute: false,
                second: false,
              }"
              @confirm="yearConfirm"
            ></u-picker>
          </u-form-item> -->
          <u-form-item label="年" prop="year">
            <DatePicker v-model="form.year" format="YYYY" disabled />
          </u-form-item>
          <u-form-item label="月" prop="month">
            <DatePicker v-model="form.month" format="YYYY-MM" />
          </u-form-item>
          <u-form-item label="日" prop="day">
            <DatePicker v-model="form.day" format="YYYY-MM-DD" />
          </u-form-item>
          <u-form-item label="性别" prop="sex"
            ><u-input
              v-model="select1.current.label"
              type="select"
              input-align="right"
              @click="select1.show = true"
          /></u-form-item>
          <u-form-item label="字典-性别" prop="aaa">
            <DictSelect v-model="form.aaa" code="teacherArchive.Gender" disabled></DictSelect>
          </u-form-item>

          <u-form-item label="水果" prop="checkbox">
            <u-checkbox-group v-model="form.checkbox" @change="checkboxGroupChange">
              <u-checkbox
                v-for="(item, index) in checkboxList1"
                :key="index"
                v-model="item.checked"
                :name="item.name"
              >
                {{ item.name }}
              </u-checkbox>
            </u-checkbox-group>
          </u-form-item>
          <u-form-item label="味道" prop="radio">
            <u-radio-group v-model="form.radio">
              <u-radio
                v-for="(item, index) in radioList1"
                :key="index"
                :name="item.name"
                :disabled="item.disabled"
              >
                {{ item.name }}
              </u-radio>
            </u-radio-group>
          </u-form-item>
          <u-form-item label="开关" prop="switchVal">
            <template #right>
              <u-switch v-model="form.switchVal"></u-switch>
            </template>
          </u-form-item>
          <u-form-item label="开关13323" prop="switchVal2">
            <template #right>
              <view class="pure-text">
                已签收，已签收已签收已签收已签收已签收已签收已签收已签收已签收
              </view>
            </template>
          </u-form-item>
        </u-form>
      </view>
      <UploadImg
        :max-count="1"
        :max-size="0.06"
        :default-file-list="form.imgList"
        title="个人照片"
        @afterUpload="imgAfterUpload"
      ></UploadImg>
    </view>
    <view class="parse-bottom">
      <view class="button-area">
        <u-button type="primary" style="height: 80rpx" @click="submit">保存</u-button>
      </view>
    </view>
  </view>
  <u-select v-model="select1.show" :list="select1.list" @confirm="onSelect1"></u-select>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DatePicker from './DatePicker.vue';
import DictSelect from './DictSelect.vue';
import UploadImg from './UploadImg.vue';

const form = ref({
  // checkbox: ['苹果'],
  // aaa: '1',
});
// form的ref
const form1 = ref();
const select1 = ref({
  show: false,
  current: {},
  list: [
    {
      value: 1,
      label: '男',
    },
    {
      value: 2,
      label: '女',
    },
  ],
});
const showYear = ref(false);
const checkboxList1 = ref([
  {
    name: '苹果',
    checked: false,
    disabled: false,
  },
  {
    name: '雪梨',
    checked: false,
    disabled: false,
  },
  {
    name: '柠檬',
    checked: false,
    disabled: false,
  },
]);
const radioList1 = ref([
  {
    name: '鲜甜',
    disabled: false,
  },
  {
    name: '麻辣',
    disabled: false,
  },
]);
const calendar1 = ref({ show: false });

function onSelect1(arr) {
  console.log('🚀ccc ~ onSelect1 ~ arr:', arr);
  let current = arr[0];
  let value = current.value;
  this.select1.current = current;
  this.form.sex = value;
}

// 上传后回调
const imgAfterUpload = imgs => {
  console.log('🚀ccc ~ imgAfterUpload ~ imgs:', imgs);
  form.value.imgList.value = imgs;
};

function yearConfirm(e) {
  console.log('🚀ccc ~ yearConfirm ~ e:', e);
}
function checkboxGroupChange(e) {
  // console.log('🚀ccc ~ checkboxGroupChange ~ e:', e);
}
function submit() {
  console.log('cccc submit', form.value);
  form1.value.validate(valid => {
    console.log(valid);
    if (valid) {
      uni.showToast({
        icon: 'none',
        title: '表单验证通过',
      });
    }
  });
}
onMounted(() => {
  form1.value.setRules({
    name: [{ required: true, message: '请输入姓名', trigger: ['change', 'blur'] }],
    // birthday: [{ required: true, message: '请输入shengri ', trigger: ['change', 'blur'] }],
    birthday: [{ required: true, message: '请选择日历', trigger: ['change', 'blur'] }],
    checkbox: [{ type: 'array', required: true, message: '请选择水果', trigger: ['blur'] }],
  });
});
</script>

<style scoped lang="scss">
.teacher-archive-parse {
  $bodyPaddingBottom: 80rpx + 48rpx + 24rpx;
  .parse-body {
    padding: 24rpx 32rpx;
    overflow: hidden;
    padding-bottom: $bodyPaddingBottom;
    padding-bottom: calc(constant(safe-area-inset-bottom) + $bodyPaddingBottom);
    padding-bottom: calc(env(safe-area-inset-bottom) + $bodyPaddingBottom);
    .parse-block {
      border-radius: 16rpx;
      background-color: #fff;
    }

    .parse-block--common {
      :deep(.u-form) {
        .u-form-item {
          padding: 13rpx 0;
        }
        .u-form-item--left {
          flex: none !important;
          width: auto !important;
          max-width: 50%;
          padding-right: 32rpx;
          line-height: 44rpx;
        }
        .u-form-item__body {
          padding: 0 32rpx;
          min-height: 56rpx;
        }
        .u-form-item--right__content__slot {
          flex-direction: row-reverse;
        }
        .u-form-item__message {
          padding-right: 32rpx !important;
          text-align: right !important;
        }
        .pure-text {
          line-height: 44rpx;
          color: rgba(0, 0, 0, 0.25);
        }
        .u-input__textarea {
          /* min-height: 70rpx !important; */
          padding: 0;
        }
        .textarea-form-item {
          .u-form-item--left__content {
            align-self: flex-start;
          }
        }
      }
    }
  }
  .parse-bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    .button-area {
      padding: 24rpx 32rpx;
    }
  }
}
</style>
