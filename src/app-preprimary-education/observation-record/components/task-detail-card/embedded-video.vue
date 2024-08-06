<template>
  <iframe
    :onload="onloadCode"
    frameborder="0"
    border="0"
    marginwidth="0"
    marginheight="0"
    scrolling="no"
    :style="`
        width: ${props.size.width};
        height: ${props.size.height};
        background: #000;
        padding: 0;
        margin: 0;
        border-radius: 12rpx;
        overflow: hidden;
      `"
  ></iframe>
</template>

<script setup>
const props = defineProps({
  url: String,
  size: Object,
});

let onloadCode = `
  const url = '${props.url}';
  const win = this.contentWindow;
  const doc = win.document;
  const width = win.innerWidth;
  const height = win.innerHeight;
  const canvas=doc.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle="#000000";
  ctx.fillRect(0,0,width,height);
  doc.body.innerHTML = '<video id="video" style="width:100%;height:100%;margin:0;padding:0;" crossorigin="anonymous" controls="controls"  src="'+url+'" ></video>';
  setTimeout(function() {
      const video = doc.querySelector('#video');
      video.setAttribute('poster', canvas.toDataURL('image/png'));
  }, 200);
  `;
</script>
