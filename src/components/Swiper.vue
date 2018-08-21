<template> 
   <div class="banner-nav">
      <div class="ban"> 
        <div class="ban_img1 rotate">
          <flexbox :gutter="0">
            <flexbox-item :span="1/3">
              <a class="a1">
                <img src="/static/img_activity1.png"> 
              </a>
            </flexbox-item>
            <flexbox-item :span="1/3">
              <a class="a2 rotating mark">
                <img src="/static/img_activity2.png"> 
              </a>
            </flexbox-item>
            <flexbox-item :span="1/3">
              <a class="a3">
                <img src="/static/img_activity3.png"> 
              </a>
            </flexbox-item> 
          </flexbox> 
       </div>   
      </div>  
      <slot></slot>
    </div> 
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
    }
  },
  watch:{},
  computed:{},
  methods:{},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
// 轮播样式
.banner-nav {
  background: #fff;
  padding-top: 0.9375rem;
  padding-bottom: 0.6875rem;
}
.ban {
  width: 100%;
  height: 10rem;
  overflow: hidden;
  position: relative;
  background: #fff;
  padding-bottom: 0.625rem;
}
.rotate {
  width: 260%;
  position: absolute;
  left: -80%;
}
.rotate a {
  width: 100%;
  height: 9.375rem;
  display: block;
  float: left;
  background: #f4f4f2;
  border-radius: 0.2rem;
  box-shadow: 0px 1px 3px #5EE2C6;
  transform: scale(0.93);
  -webkit-transform: scale(0.93);
  -moz-transform: scale(0.93);
  -o-transform: scale(0.93);
  -ms-transform: scale(0.93);
}
.rotate a img {
  width: 100%;
  height: 9.375rem;
  display: block;
  border-radius: 0.2rem;
}
.rotate .rotating {
  transform: scale(1);
  -webkit-transform: scale(1);
  -moz-transform: scale(1);
  -o-transform: scale(1);
  -ms-transform: scale(1);
}
</style>