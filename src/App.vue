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
// @import '~vux/src/styles/weui/weui.less';
@import '~vux/src/styles/1px.less';
*{ 
  box-sizing: border-box;
}
body {
  background-color: #fbf9fe;
}
#app{
  height:100%;
  background: #eee;
}
html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
.head {
  height: 66px;
  padding: 30px 0 8px;
  background: linear-gradient(#A1FED6, #13C3B5);
}
.return{
  width:25px;
  height:25px;
  margin-left:15px;
} 
.filter{
  width:25px;
  height:25px; 
}
.return img,.filter img{
  width:100%;
  height:100%;
}
.head-title{
  color:#fff;
  font-size: 18px;
  text-align: center;
}
 .sup-phone{
    display:flex;
    text-align: center; 
  align-items: center;
    justify-content:center;
} 
.phone-icon{
    width:16px;
    height:100%;
    text-align: center;
    vertical-align:middle;
    margin-right:3px;
} 
.phone-icon img{
    width:100%;
    height:100%;
    vertical-align: middle
} 
.phone-icon span{height: 100%;vertical-align: middle;display: inline-block}
.sup-foot{ 
  position: absolute;
  bottom:0;
  width:100%;
  box-shadow: 0px -1px 3px #5EE2C6;
  z-index: 1000;
}
.sup-foot a{ 
    height:49px;
    background:#fff;
    color:#5EE2C6;
    text-align: center;
    display:block;
}
.sup-foot a>div{
    height:100%;
}
.sup-foot a:not(:first-child){
    border-left:1px solid #eee;
}
.sup-foot p{
    line-height: 49px;
}
a.active{
    background:#5EE2C6;
    color:#fff;
}
.tab-act{
    color:inherit;
    display:block;
    width:100%;
    height:100%;
}
p.sup-title{
  text-align: left; 
  font-size:16px;
  color:#666;
  margin-bottom:15px;
}
</style>
