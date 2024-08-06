<template>
  <c-card>
    <view class="flex">
      <image
        v-if="showImg && user.gender"
        :src="user.img ? user.img : user.gender === 2 ? img_girl : img_boy"
        class="icon-88 mr-l"
      />
      <view class="flex-column-plain flex-grow">
        <view class="flex-inline">
          <text class="font-xt bold mr-xs">{{ user.name }}</text>
          <c-icon v-if="user.gender === 2" name="icon_gender_female" size="32" color-type="error" />
          <c-icon v-else name="icon_male" size="32" color-type="primary" />
        </view>
        <view class="mt-xxs">
          <text class="font-secondary color-placeholder">
            {{ user.desc }}
          </text>
        </view>
      </view>
      <slot />
    </view>
  </c-card>
</template>
<script lang="ts">
import img_boy from '@/app-school-affairs/static/profile/profile_boy.png';
import img_girl from '@/app-school-affairs/static/profile/profile_girl.png';
import { defineComponent, PropType } from 'vue';
export interface IUserProfile {
  name: string;
  img: string;
  gender: number;
  desc: string;
}
export default defineComponent({
  props: {
    showImg: { type: Boolean, default: true },
    user: { type: Object as PropType<IUserProfile>, default: () => {} },
  },
  emits: [],
  setup() {
    return { img_boy, img_girl };
  },
});
</script>
<style scoped lang="scss"></style>
