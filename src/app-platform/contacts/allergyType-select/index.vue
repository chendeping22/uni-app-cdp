<template>
  <page custom-overflow="scroll">
    <view style="/* 设置阴影 */ box-shadow: 0px 0px 3px 3px rgba(0, 0, 0, 0.03)"></view>
    <view style="margin-top: 24rpx" />
    <FormGroup>
      <u-checkbox-group v-model="selectedAllergyTypes" :wrap="true" size="48" icon-size="30">
        <u-checkbox
          v-for="(item, index) in allergyTypes"
          :key="item.value"
          v-model="item.isCheck"
          :name="item.value"
          icon-size="30"
          label-size="34"
          shape="circle"
          :style="{
            marginTop: index == 0 ? '24rpx' : '0',
            marginBottom: index == allergyTypes.length - 1 ? '24rpx' : '0',
          }"
        >
          {{ item.label }}
        </u-checkbox>
      </u-checkbox-group>
      <view v-if="isSelectedOther" class="border border-line-default radius-default">
        <u-input
          v-model="allergyDetail"
          type="textarea"
          :maxlength="50"
          :custom-style="{
            fontSize: '34rpx',
            fontWeight: '400',
            paddingLeft: '10rpx',
            paddingRight: '10rpx',
          }"
        />
        <view class="flex-between pb-s pr-l color-placeholder">
          <text></text>
          <text>{{ allergyDetail?.length }}/50</text>
        </view>
      </view>
      <view style="height: 24rpx"></view>
    </FormGroup>

    <view>
      <view style="height: 128rpx"></view>
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
    <view class="bottom-btn">
      <view style="/* 设置阴影 */ box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08)"></view>
      <u-button
        :plain="true"
        shape="square"
        :custom-style="{
          marginTop: '24rpx',
          marginLeft: '32rpx',
          marginRight: '32rpx',
          marginBottom: '24rpx',
          color: '#ffffff',
          height: '80rpx',
          borderRadius: '16rpx',
          borderColor: '#176bfb',
          backgroundColor: '#176bfb',
          fontSize: '30rpx',
          fontWeight: '500',
        }"
        @click="handleSubmit"
        >确定</u-button
      >
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
  </page>
  <!-- <c-bottom>
    <c-button @click="handleSubmit">
      <text>确定</text>
    </c-button>
  </c-bottom> -->
</template>
<script lang="ts" setup>
import FormGroup from '@/app-platform/contacts/components/form-group/index.vue';
import { onLoad } from '@dcloudio/uni-app';
import { computed, onMounted, reactive, ref } from 'vue';

enum AllergyType {
  HighProtein = '1',
  AquaticProducts = '2',
  NutsAndSeeds = '3',
  Fruits = '4',
  Drug = '5',
  Other = '6',
}
let studentAllergy: any;

onLoad(option => {
  if (option) {
    studentAllergy = option?.initData;
    console.log('studentAllergy : ', studentAllergy);
  }
});

const allergyTypes = reactive([
  {
    label: '高蛋白过敏（鸡蛋、牛奶、牛肉等）',
    value: AllergyType.HighProtein,
    isCheck: false,
  },
  {
    label: '水产品过敏（鱼、虾、蟹、贝等）',
    value: AllergyType.AquaticProducts,
    isCheck: false,
  },
  {
    label: '坚果和种子过敏（花生、黄豆、腰果、杏仁等）',
    value: AllergyType.NutsAndSeeds,
    isCheck: false,
  },
  {
    label: '水果过敏（芒果、草莓、菠萝等）',
    value: AllergyType.Fruits,
    isCheck: false,
  },
  {
    label: '药物过敏',
    value: AllergyType.Drug,
    isCheck: false,
  },
  {
    label: '其他过敏',
    value: AllergyType.Other,
    isCheck: false,
  },
]);
const selectedAllergyTypes = ref<any[]>([]);
const allergyDetail = ref<string | null>('');
// 是否选择其他过敏信息
const isSelectedOther = computed(() => {
  return selectedAllergyTypes.value?.includes(AllergyType.Other);
});

const handleSubmit = async () => {
  // 若没有选择其他过敏，则不传递其他过敏描述
  const otherAllergy = isSelectedOther.value ? allergyDetail.value : '';
  uni.$emit('onAllergySelected', {
    allergyTypeList: selectedAllergyTypes.value,
    allergyDetail: otherAllergy,
  });
  uni.navigateBack();
};

// watch(selectedAllergyTypes.value, v => {
//   console.log('🚀 ~ file: allergy-select.vue ~ line 92 ~ watch ~ v', v);
// });

onMounted(() => {
  const studentAllergyObj = JSON.parse(studentAllergy);
  const { types = [], otherDesc = '' } = studentAllergyObj;
  console.log('types : ' + JSON.stringify(types) + ', otherDesc : ' + otherDesc);
  selectedAllergyTypes.value = types.map((item: any) => item + '');
  console.log('selectedAllergyTypes : ' + JSON.stringify(selectedAllergyTypes.value));
  allergyDetail.value = otherDesc || '';
  Object.assign(
    allergyTypes,
    allergyTypes.map((item: any) => {
      item.isCheck = selectedAllergyTypes.value.includes(item.value);
      return item;
    }),
  );
});
</script>
<style scoped lang="scss">
.bottom-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
}
.border,
.border-solid {
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
}
.border-line-default {
  border-color: #e5e6eb;
}
.radius-default {
  border-radius: 12rpx;
}
.radio {
  transform: scale(0.8);
  width: 48rpx;
  height: 48rpx;
}
.flex-column-plain {
  display: flex;
  flex-direction: column;
}
.form-group {
  padding: 24rpx;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pb-s {
  padding-bottom: 16rpx;
}
.pr-l {
  padding-right: 32rpx;
}
.color-placeholder {
  color: #00000073;
}
.u-fixed-placeholder {
  /* #ifndef APP-NVUE */
  box-sizing: content-box;
  /* #endif */
}
:deep(.u-checkbox) {
  height: 96rpx;
}
:deep(.u-checkbox__label) {
  margin-left: 32rpx;
  margin-right: 32rpx;
  color: #000000e0;
  font-size: 34rpx;
}
</style>
