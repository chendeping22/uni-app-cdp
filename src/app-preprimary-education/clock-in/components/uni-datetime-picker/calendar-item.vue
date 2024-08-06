<template>
  <view
    class="uni-calendar-item__weeks-box"
    :class="{
      'uni-calendar-item--disable': weeks.disable,
      'uni-calendar-item--before-checked-x': weeks.beforeMultiple,
      'uni-calendar-item--multiple': weeks.multiple,
      'uni-calendar-item--after-checked-x': weeks.afterMultiple,
    }"
    @click="choiceDate(weeks)"
    @mouseenter="handleMousemove(weeks)"
  >
    <view
      class="uni-calendar-item__weeks-box-item"
      :class="{
        'uni-calendar-item--checked':
          calendar.fullDate === weeks.fullDate && (calendar.userChecked || !checkHover),
        'uni-calendar-item--checked-range-text': checkHover,
        'uni-calendar-item--before-checked': weeks.beforeMultiple,
        'uni-calendar-item--multiple': weeks.multiple,
        'uni-calendar-item--after-checked': weeks.afterMultiple,
        'uni-calendar-item--disable': weeks.disable,
      }"
    >
      <text v-if="selected && weeks.extraInfo" class="uni-calendar-item__weeks-box-circle"></text>
      <text
        class="uni-calendar-item__weeks-box-text uni-calendar-item__weeks-box-text-disable uni-calendar-item--checked-text"
        >{{ weeks.date }}</text
      >
    </view>
    <view :class="{ 'uni-calendar-item--isDay': weeks.isDay }"></view>
  </view>
</template>

<script>
export default {
  props: {
    weeks: {
      type: Object,
      default() {
        return {};
      },
    },
    calendar: {
      type: Object,
      default: () => {
        return {};
      },
    },
    selected: {
      type: Array,
      default: () => {
        return [];
      },
    },
    lunar: {
      type: Boolean,
      default: false,
    },
    checkHover: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    choiceDate(weeks) {
      this.$emit('change', weeks);
    },
    handleMousemove(weeks) {
      this.$emit('handleMouse', weeks);
    },
  },
};
</script>

<style lang="scss" scoped>
.uni-calendar-item__weeks-box {
  flex: 1;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 1px 0;
  position: relative;
}

.uni-calendar-item__weeks-box-text {
  font-size: $ui-font-size-content;
  // font-family: Lato-Bold, Lato;
  font-weight: bold;
  color: $ui-color-base;
}

.uni-calendar-item__weeks-lunar-text {
  font-size: $ui-font-size-secondary;
  color: $ui-color-placeholder;
}

.uni-calendar-item__weeks-box-item {
  position: relative;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}

.uni-calendar-item__weeks-box-circle {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  background-color: $ui-color-error;
}

.uni-calendar-item__weeks-box .uni-calendar-item--disable {
  // background-color: rgba(249, 249, 249, $uni-opacity-disabled);
  cursor: default;
}

.uni-calendar-item--disable .uni-calendar-item__weeks-box-text-disable {
  color: $ui-color-disabled;
}

.uni-calendar-item--isDay {
  position: absolute;
  top: 10px;
  right: 17%;
  background-color: $ui-color-error;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.uni-calendar-item--extra {
  color: $ui-color-error;
  opacity: 0.8;
}

.uni-calendar-item__weeks-box .uni-calendar-item--checked {
  background-color: $ui-color-primary;
  border-radius: 50%;
  box-sizing: border-box;
  border: 3px solid $ui-color-white;
}

.uni-calendar-item--checked .uni-calendar-item--checked-text {
  color: $ui-color-white;
}

.uni-calendar-item--multiple .uni-calendar-item--checked-range-text {
  color: $ui-color-placeholder;
}

.uni-calendar-item--multiple {
  background-color: $ui-color-fill-light;
}

.uni-calendar-item--multiple .uni-calendar-item--before-checked,
.uni-calendar-item--multiple .uni-calendar-item--after-checked {
  background-color: $ui-color-blue;
  border-radius: 50%;
  box-sizing: border-box;
  border: 3px solid $ui-color-line-light;
}

.uni-calendar-item--before-checked .uni-calendar-item--checked-text,
.uni-calendar-item--after-checked .uni-calendar-item--checked-text {
  color: $ui-color-white;
}

.uni-calendar-item--before-checked-x {
  border-top-left-radius: 50px;
  border-bottom-left-radius: 50px;
  box-sizing: border-box;
  background-color: $ui-color-fill-light;
}

.uni-calendar-item--after-checked-x {
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
  background-color: $ui-color-fill-light;
}
</style>
