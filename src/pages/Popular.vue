<template>
  <div>
      <c-head>  
        <div slot='left'>
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
        </div> 
        <div slot='center' class="head-title">热门推荐</div> 
    </c-head>  
    <div>
      <tab :line-width="1" custom-bar-width="0px"  @on-before-index-change="switchTabItem">
        <tab-item selected >周边新闻</tab-item>
        <tab-item  class="vux-1px-l">活动咨询</tab-item>
        <tab-item class="vux-1px-l">学校咨询</tab-item>
        <tab-item class="vux-1px-l">培训咨询</tab-item>
      </tab> 
    </div>
     <div class="popular-content">
      <div class="popular-box">
        <p>宝宝幼儿园招生</p> 
        <flexbox :gutter="15">
          <flexbox-item :span="10/23">
            <div class="popular-img"> 
              <img src="/static/img_institutions04.png" alt="">
            </div>
          </flexbox-item>
          <flexbox-item :span="12/23"> 
            <div class="text-box">
              <flexbox orient="vertical" :gutter="20">
                <flexbox-item :span="3/5">
                  <p class="text">生宝宝幼儿园招生宝宝幼儿园招生宝宝幼儿园招生宝儿园招生宝宝幼儿园招生</p>
                </flexbox-item>
                <flexbox-item :span="3/5"> 
                  <flexbox>
                    <flexbox-item>
                      <p class="date">17-06-28</p>
                    </flexbox-item>
                    <flexbox-item>  
                         <flexbox :gutter='2'>
                            <flexbox-item :span="5/7"> <p class="count">526742</p> </flexbox-item>
                            <flexbox-item><div class="eye"> <img src="/static/icon_eyes.png" alt=""></div></flexbox-item>
                          </flexbox>
                    </flexbox-item>
                  </flexbox>
                </flexbox-item>
              </flexbox>
            </div> 
          </flexbox-item> 
        </flexbox>
      </div>  
       <div class="popular-box" style="background:#fff">
        <p>宝宝幼儿园招生</p> 
        <flexbox :gutter="15">
          <flexbox-item :span="10/23">
            <div class="popular-img"> 
              <img src="/static/img_institutions04.png" alt="">
            </div>
          </flexbox-item>
          <flexbox-item :span="12/23"> 
            <div class="text-box">
              <flexbox orient="vertical" :gutter="20">
                <flexbox-item :span="3/5">
                  <p class="text">生宝宝幼儿园招生宝宝幼儿园招生宝宝幼儿园招生宝儿园招生宝宝幼儿园招生</p>
                </flexbox-item>
                <flexbox-item :span="3/5"> 
                  <flexbox>
                    <flexbox-item>
                      <p class="date">17-06-28</p>
                    </flexbox-item>
                    <flexbox-item>  
                         <flexbox :gutter='2'>
                            <flexbox-item :span="5/7"> <p class="count">526742</p> </flexbox-item>
                            <flexbox-item><div class="eye"> <img src="/static/icon_eyes.png" alt=""></div></flexbox-item>
                          </flexbox>
                    </flexbox-item>
                  </flexbox>
                </flexbox-item>
              </flexbox>
            </div> 
          </flexbox-item> 
        </flexbox>
      </div>
       <div class="popular-box" style="background:#fff">
        <p>宝宝幼儿园招生</p> 
        <flexbox :gutter="15">
          <flexbox-item :span="10/23">
            <div class="popular-img"> 
              <img src="/static/img_institutions04.png" alt="">
            </div>
          </flexbox-item>
          <flexbox-item :span="12/23"> 
            <div class="text-box">
              <flexbox orient="vertical" :gutter="20">
                <flexbox-item :span="3/5">
                  <p class="text">生宝宝幼儿园招生宝宝幼儿园招生宝宝幼儿园招生宝儿园招生宝宝幼儿园招生</p>
                </flexbox-item>
                <flexbox-item :span="3/5"> 
                  <flexbox>
                    <flexbox-item>
                      <p class="date">17-06-28</p>
                    </flexbox-item>
                    <flexbox-item>  
                         <flexbox :gutter='2'>
                            <flexbox-item :span="5/7"> <p class="count">526742</p> </flexbox-item>
                            <flexbox-item><div class="eye"> <img src="/static/icon_eyes.png" alt=""></div></flexbox-item>
                          </flexbox>
                    </flexbox-item>
                  </flexbox>
                </flexbox-item>
              </flexbox>
            </div> 
          </flexbox-item> 
        </flexbox>
      </div>
       <div class="popular-box" style="background:#fff">
        <p>宝宝幼儿园招生</p> 
        <flexbox :gutter="15">
          <flexbox-item :span="10/23">
            <div class="popular-img"> 
              <img src="/static/img_institutions04.png" alt="">
            </div>
          </flexbox-item>
          <flexbox-item :span="12/23"> 
            <div class="text-box">
              <flexbox orient="vertical" :gutter="20">
                <flexbox-item :span="3/5">
                  <p class="text">生宝宝幼儿园招生宝宝幼儿园招生宝宝幼儿园招生宝儿园招生宝宝幼儿园招生</p>
                </flexbox-item>
                <flexbox-item :span="3/5"> 
                  <flexbox>
                    <flexbox-item>
                      <p class="date">17-06-28</p>
                    </flexbox-item>
                    <flexbox-item>  
                         <flexbox :gutter='2'>
                            <flexbox-item :span="5/7"> <p class="count">526742</p> </flexbox-item>
                            <flexbox-item><div class="eye"> <img src="/static/icon_eyes.png" alt=""></div></flexbox-item>
                          </flexbox>
                    </flexbox-item>
                  </flexbox>
                </flexbox-item>
              </flexbox>
            </div> 
          </flexbox-item> 
        </flexbox>
      </div>
       <div class="popular-box" style="background:#fff">
        <p>宝宝幼儿园招生</p> 
        <flexbox :gutter="15">
          <flexbox-item :span="10/23">
            <div class="popular-img"> 
              <img src="/static/img_institutions04.png" alt="">
            </div>
          </flexbox-item>
          <flexbox-item :span="12/23"> 
            <div class="text-box">
              <flexbox orient="vertical" :gutter="20">
                <flexbox-item :span="3/5">
                  <p class="text">生宝宝幼儿园招生宝宝幼儿园招生宝宝幼儿园招生宝儿园招生宝宝幼儿园招生</p>
                </flexbox-item>
                <flexbox-item :span="3/5"> 
                  <flexbox>
                    <flexbox-item>
                      <p class="date">17-06-28</p>
                    </flexbox-item>
                    <flexbox-item>  
                         <flexbox :gutter='2'>
                            <flexbox-item :span="5/7"> <p class="count">526742</p> </flexbox-item>
                            <flexbox-item><div class="eye"> <img src="/static/icon_eyes.png" alt=""></div></flexbox-item>
                          </flexbox>
                    </flexbox-item>
                  </flexbox>
                </flexbox-item>
              </flexbox>
            </div> 
          </flexbox-item> 
        </flexbox>
      </div>
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
    },
    switchTabItem (index) {
      console.log('on-before-index-change', index)
      this.$vux.loading.show({
        text: 'loading'
      })
      setTimeout(() => {
        this.$vux.loading.hide()
        this.index01 = index
      }, 1000)
    }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
  .vux-1px-l:before{
    top:50%;
    transform: translateY(-13px);
    height:26px;
    border-color:#eee;
  }
  .popular-content {
  background: #fff;
}
.popular-box {
  height: 150px;
  width: 100%;
  padding: 10px 15px;
  background: url("/static/icon_recommended.png") no-repeat;
  background-position: 100% 0;
  background-size: 47px 47px;
  border-top:1px solid #EEEEEE;
}
.popular-box > p {
  font-size: 16px;
  color: #666666;
  margin-bottom:5px;
}
.popular-box:first-child{
  border-top:none;
}
.popular-img {
  width: 100%;
  height: 100px;
}
.popular-img img {
  width: 100%;
  height: 100%;
}
.popular-box .text{
  font-size:12px;
  color:#666666;
}
.text-box{
  width:100%;
  padding-top:5px;
  height:100px;
} 
.eye{
  width:20px;
  height:20px;
}
.eye img{
  width:100%;
  height:100%;
}
.date{
  font-size:12px;
  color:#666666;
}
.count{
  font-size:12px;
  color:#FC8989;
  text-align: right;
}
</style>