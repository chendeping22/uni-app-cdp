<template>
  <div class='scenery'> 
      <c-head>  
        <div slot='left'>
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
        </div> 
        <div slot='center' class="head-title">学校风采</div> 
    </c-head>
    <div class='main'> 
        <flexbox :gutter='15'>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>  
        </flexbox> 
        <flexbox :gutter='15'>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>  
        </flexbox> 
        <flexbox :gutter='15'>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>  
        </flexbox> 
        <flexbox :gutter='15'>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>  
        </flexbox> 
        <flexbox :gutter='15'>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>  
        </flexbox> 
        <flexbox :gutter='15'>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>  
        </flexbox> 
        <flexbox :gutter='15'>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>
            <flexbox-item> 
                <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
            </flexbox-item>  
        </flexbox> 
    </div>
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
  methods:{
      turnUp:function(){
          this.$router.go(-1)
      }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
.scenery{
    height:100%;
    background: #fff;
}
.main{
    padding:15px;
}
.into-img{ 
    height:110px;
    margin-bottom:15px;
}
.into-img img{
    width:100%;
    height:100%;
}
</style>