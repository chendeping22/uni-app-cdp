<template>
  <page custom-overflow="scroll">
    <view class="map-container">
      <map
        style="width: 100%; height: 100%"
        :latitude="mapObj.latitude"
        :longitude="mapObj.longitude"
        :circles="circles"
        :scale="18"
        :markers="markers"
      />
    </view>
  </page>
</template>

<script lang="ts" setup>
import { getPageParams } from '@/utils/tools';
import { onMounted, ref } from 'vue';

let mapObj = ref({
  latitude: 0,
  longitude: 0,
  radius: 100,
});

const circlesDefault = {
  fillColor: '#1e90ff33',
  color: '#1e90ff',
  strokeWidth: 2,
};
const markersDefault = {
  id: 0,
  iconPath: '../../static/attendance/location.png',
  anchor: {
    x: 0.5,
    y: 0.5,
  },
};
const circles: any = ref([]);
const markers: any = ref([]);
onMounted(() => {
  const params = getPageParams();
  console.log('params', params);
  mapObj.value = {
    latitude: Number(params.lat),
    longitude: Number(params.lng),
    radius: Number(params.radius),
  };
  circles.value = [{ ...mapObj.value, ...circlesDefault }];
  markers.value = [{ ...mapObj.value, ...markersDefault }];
  console.log('map params', circles.value, typeof mapObj.value.radius);
});
</script>

<style lang="scss" scoped>
.map-container {
  display: flex;
  height: 100%;
}
.rule-container {
  padding: 24rpx 32rpx;
}
</style>
