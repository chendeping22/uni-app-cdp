<template>
  <div>
      <c-head>  
        <div slot='left'>
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
        </div> 
        <div slot='center' class="head-title">发现</div> 
    </c-head>  
    <div> 
      <c-swiper></c-swiper>
    </div>
    <div class="find-content">
      <div class="find-box">
        <div class="find-head">
          <div class="find-img">
            <img src="/static/img_Head.png" alt="">
          </div>
          <div class="find-text">
            <p>琪琪幼儿园</p>
            <p>今天天气真好</p>
          </div>
        </div>
        <div class="find-main"> 
          <flexbox :gutter='12.5'>
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
          </flexbox>
        </div>
        <div class="find-foot"> 
          <flexbox>
            <flexbox-item><div><p>8月3日 12:00</p></div></flexbox-item> 
            <flexbox-item>  
              <flexbox>
                <flexbox-item>  
                  <flexbox>
                    <flexbox-item :span='2/7'> <div class="find-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                  </flexbox> 
                </flexbox-item> 
                <flexbox-item>  
                  <flexbox>
                    <flexbox-item :span='2/7'> <div class="find-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                  </flexbox> 
                </flexbox-item>  
              </flexbox> 
            </flexbox-item>  
          </flexbox>
        </div>
      </div> 
    </div>
    <div class="find-content">
      <div class="find-box">
        <div class="find-head">
          <div class="find-img">
            <img src="/static/img_Head.png" alt="">
          </div>
          <div class="find-text">
            <p>琪琪幼儿园</p>
            <p>今天天气真好</p>
          </div>
        </div>
        <div class="find-main"> 
          <flexbox :gutter='12.5'>
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
          </flexbox>
        </div>
        <div class="find-foot"> 
          <flexbox>
            <flexbox-item><div><p>8月3日 12:00</p></div></flexbox-item> 
            <flexbox-item>  
              <flexbox>
                <flexbox-item>  
                  <flexbox>
                    <flexbox-item :span='2/7'> <div class="find-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                  </flexbox> 
                </flexbox-item> 
                <flexbox-item>  
                  <flexbox>
                    <flexbox-item :span='2/7'> <div class="find-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                  </flexbox> 
                </flexbox-item>  
              </flexbox> 
            </flexbox-item>  
          </flexbox>
        </div>
      </div> 
    </div>
    <div class="find-content">
      <div class="find-box">
        <div class="find-head">
          <div class="find-img">
            <img src="/static/img_Head.png" alt="">
          </div>
          <div class="find-text">
            <p>琪琪幼儿园</p>
            <p>今天天气真好</p>
          </div>
        </div>
        <div class="find-main"> 
          <flexbox :gutter='12.5'>
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
            <flexbox-item><div class="find-main-img"><img src="/static/img_image.png" alt=""></div></flexbox-item> 
          </flexbox>
        </div>
        <div class="find-foot"> 
          <flexbox>
            <flexbox-item><div><p>8月3日 12:00</p></div></flexbox-item> 
            <flexbox-item>  
              <flexbox>
                <flexbox-item>  
                  <flexbox>
                    <flexbox-item :span='2/7'> <div class="find-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                  </flexbox> 
                </flexbox-item> 
                <flexbox-item>  
                  <flexbox>
                    <flexbox-item :span='2/7'> <div class="find-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                  </flexbox> 
                </flexbox-item>  
              </flexbox> 
            </flexbox-item>  
          </flexbox>
        </div>
      </div> 
    </div>
    <router-link  class='release' to='/find/release'>
      <img src="/static/circle_btn_release.png" alt="">
    </router-link>
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
.find-content{
  background: #fff;
}
.find-box{
  padding:10px 25px;
  position:relative;
}
.find-box::before{
  content: '';
  height:1px;
  background: #eee;
  position: absolute;
  bottom:0;
  left:5%;
  width:90%;
}
.find-head{
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
}
.find-main{
  padding:10px 0;
}
.find-img{
  margin-right: .8em;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
}
.find-img img,.find-main-img img{
  width:100%;
  height:100%;
}
.find-text{
  font-size:14px;
  color:#666;
} 
.find-foot p{
  font-size:10px;
  color:#ccc;
}
.find-icon{
  width:20px;
  height:18px;
  vertical-align: top;
}
.find-icon img{
  width:100%;
  height:100%;
}
.release{
  position:fixed;
  bottom:9px;
  right:16px;
  width:45px;
  height:45px;
  vertical-align: middle;
  display:block;
}
.release img{
  width:100%;
  height:100%;
}
</style>