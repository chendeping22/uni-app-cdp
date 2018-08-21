<template>
  <div>
      <c-head> 
        <div slot='left' >
            <div class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div>
        </div>
        <p slot='center' class='user-title'>个人资料</p>   
      </c-head>
        <div class='user-main'>
            <group :gutter='15'> 
                <cell is-link>
                    <p slot='title'>头像</p>
                    <div slot='value'>
                        <div class='user-img'><img src="/static/img_image01.png" alt=""></div>
                    </div>
                </cell>   
                <cell is-link>
                    <p slot='title'>姓名</p>
                    <p slot='value'>杨</p>
                </cell>   
                <cell is-link>
                    <p slot='title'>性别</p>
                    <p slot='value'>女</p>
                </cell>  
                <cell is-link>
                    <p slot='title'>昵称</p>
                    <p slot='value'>宝宝</p>
                </cell>
                <cell is-link>
                    <p slot='title'>所属学校</p>
                    <p slot='value'>优学教育</p>
                </cell>      
            </group>
            <group :gutter='10'>   
                <cell is-link>
                    <p slot='title'>手机</p>
                    <p slot='value'>123456789</p>
                </cell>  
                <cell is-link>
                    <p slot='title'>邮箱</p>
                    <p slot='value'>123456789@qq.com</p>
                </cell>       
            </group>
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
      console.log('进入');
      this.$router.go(-1);
    }
  },
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.user-title{
    font-size:18px;
    color:#fff;
    text-align: center;
}
.user-img{
    width:60px;
    height:60px;
    vertical-align: middle;
}
.user-img img{
    width:100%;
    height:100%;
}
.user-main p{
    font-size:14px;
    color:#666;
}
</style>