<template>
	<web-view :src="pagaData.url"></web-view>
</template>

<script setup>
	import { onLoad } from '@dcloudio/uni-app';
	import { reactive } from 'vue';
	const pagaData = reactive({
		url: ''
	})
	
	onLoad((option) => {
		pagaData.url = `http://192.168.1.19:3000/h5${decodeURIComponent(option.url)}`;
	})
</script>
