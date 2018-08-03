<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';  
@import '~vux/src/styles/weui/weui.less'; 
*{ 
  box-sizing: border-box;
}
body {
  background-color: #fbf9fe;
}
#app{
  height:100%;
}
html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
.head {
  height: 66px;
  padding: 30px 0 8px;
  background: linear-gradient(#f4eb8b, #fbb03b);
}
</style>
