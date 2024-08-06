<template>
  <view class="">
    <view v-for="(item, index) in list" :key="index" class="ques-card zy-shadow">
      <view class="ques-card--head zy-border-solid-bottom">
        <view class="ques-card--index">
          <image
            style="width: 44rpx; height: 40rpx"
            src="../../assets/image/icon_ques_tag.svg"
            mode="widthFix"
          />
          <text class="ques-card--index-text">{{ index < 9 ? '0' + (index + 1) : index + 1 }}</text>
        </view>
        <view>
          <text>{{ item.question }}</text>
          <text v-if="item.type == '1'">(单选)</text>
          <text v-else-if="item.type == '3'">(多选)</text>
          <text v-if="item.isRequired == '1'" class="required-flag">*</text>
        </view>
      </view>
      <!-- 单选题 -->
      <block v-if="item.type == '1'">
        <radio-group @change="e => radioChange(e, index)">
          <label v-for="topic in item.questionOptionList" :key="topic.id">
            <view class="zy-flex zy-flex-col-center topic-item" hover-class="hover-bg--gray">
              <radio
                :disabled="disabled"
                :value="topic.id"
                :checked="topic.checked"
                color="#176BFB"
                style="transform: scale(0.7)"
              />
              <text>{{ topic.optionContent }}</text>
            </view>
          </label>
        </radio-group>
      </block>
      <!-- 多选题 -->
      <block v-else-if="item.type == '3'">
        <checkbox-group @change="e => checkboxChange(e, index)">
          <label v-for="(topic, topicIndex) in item.questionOptionList" :key="topicIndex">
            <view class="zy-flex zy-flex-col-center topic-item" hover-class="hover-bg--gray">
              <checkbox
                :disabled="disabled"
                :value="topic.id"
                :checked="topic.checked"
                color="#176BFB"
                style="transform: scale(0.7)"
              />
              <text>{{ topic.optionContent }}</text>
            </view>
          </label>
        </checkbox-group>
      </block>
      <!-- 主观题 -->
      <view v-else-if="item.type == '2'" class="ques-card--input">
        <textarea v-model="item.answerContent" :disabled="disabled" placeholder="请输入内容" />
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const radioChange = (e, index) => {
  props.list[index].optionId = e.detail.value;
  props.list[index].questionId = props.list[index].id;
};
const checkboxChange = (e, index) => {
  let value = e.detail.value;
  props.list[index].optionId = value.toString();
  props.list[index].questionId = props.list[index].id;
};
</script>

<style lang="scss" scoped>
.ques-card {
  background: $zy-middle-color2;
  border-radius: 12rpx;
  margin-bottom: 20rpx;

  &--head {
    display: flex;
    margin: 0 30rpx;
    padding: 20rpx 0;
  }

  &--index {
    position: relative;
    margin-right: 20rpx;
    color: $zy-middle-color2;
    font-size: $zy-font-size24;

    &-text {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      line-height: 40rpx;
      text-align: center;
    }
  }

  .topic-item {
    padding: 20rpx 30rpx;
  }

  &--input {
    margin: 20rpx 30rpx;
    line-height: 48rpx;
    font-size: $zy-font-size28;
  }
}

.required-flag {
  color: $zy-spare-color7;
  margin-left: 10rpx;
}
</style>
