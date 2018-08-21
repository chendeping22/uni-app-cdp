<template>
  <div class="act-detail">
      <div class='head'>
        <flexbox :gutter='0'>
            <flexbox-item :span="1/5" >  
            <div  class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div> 
            </flexbox-item>
            <flexbox-item :span="3/5">  
                 <p class="head-title">活动详情</p>
            </flexbox-item> 
            <flexbox-item :span="1/5">  
                <flexbox :gutter='10'>
                <flexbox-item :span='1/3'><div class="detial-star"><img src="/static/btn_hollow_Focus.png" alt=""></div></flexbox-item>
                <flexbox-item :span='1/3'><div class="detial-share"><img src="/static/btn_white_share.png" alt=""></div></flexbox-item>
                </flexbox>
            </flexbox-item> 
        </flexbox> 
      </div> 
        <div class="act-banner">
            <img src="/static/act-banner.png" alt=""> 
        </div>  
        <div class="act-foot"> 
            <h4 class="act-title">第一届幼学网幼儿接力比赛</h4>
            <flexbox :gutter="0"> 
                <flexbox-item :span="2/5">  
                    <flexbox>
                        <flexbox-item >  
                            <flexbox :gutter="0">
                                <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                                <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                            </flexbox> 
                        </flexbox-item> 
                        <flexbox-item >  
                            <flexbox :gutter="0">
                                <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                                <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                            </flexbox> 
                        </flexbox-item>  
                    </flexbox> 
                </flexbox-item>   
                <flexbox-item :span="3/5"> 
                    <div class="act-status"><p>报名中</p></div>
                </flexbox-item>   
            </flexbox>
        </div> 
        <div class="act-time">
            <div class="time-icon"><span></span><img src="/static/icon_grey_time.png" alt=""></div>
            <div class="time-title">
                <p>报名截止时间：8月30日</p>
                <p>活动开始时间：9月01日</p>
            </div>
        </div>
        <group :gutter="0">   
            <cell is-link>
                <p slot='title' class="link-title">东莞123号</p>
                <img slot="icon" width="16" style="display:block;margin-right:5px;" src="/static/icon_grey_positioning.png">
            </cell>
            <cell is-link>
                <p slot='title' class="link-title">0769-1234567</p>
                <img slot="icon" width="16" style="display:block;margin-right:5px;" src="/static/icon_grey_phone.png">
            </cell>
            <cell>
                <p slot='title' class="link-title yuan">￥200</p>
                <img slot="icon" width="16" style="display:block;margin-right:5px;" src="/static/icon_grey_money.png">
            </cell>
        </group>
        <div class="act-support">
            <p class='sup-title'>活动赞助商</p>
             <flexbox :gutter="0">
            <flexbox-item>
              <a>
                <div class="sup-icon">
                    <img src="/static/apple.png">
                </div>
                <p> 
                  <span>苹果宝</span>
                </p>
              </a>
            </flexbox-item>
            <flexbox-item>
              <router-link to='/home/fine'>
                <div class="sup-icon"> 
                    <img src="/static/apple.png">
                </div>
                <p>
                  <span>苹果宝</span></p>
              </router-link>
            </flexbox-item>
            <flexbox-item>
              <router-link to='/home/activity'>
                <div class="sup-icon"> 
                  <img src="/static/apple.png">
                  </div> 
                  <p ><span>苹果宝</span></p>
              </router-link>
            </flexbox-item>
            <flexbox-item>
              <a>
                <div class="sup-icon"> 
                  <img src="/static/apple.png">
                </div> 
                <p><span>苹果宝</span></p>
              </a>
            </flexbox-item> 
          </flexbox>
        </div> 
        <div class="sup-nav"> 
            <tab :line-width="1" custom-bar-width="80px"  @on-before-index-change="switchTabItem">
                <tab-item selected >
                    <router-link class="tab-act" to='/home/activity/detail/actintro'>
                        活动介绍
                    </router-link>
                </tab-item>
                <tab-item  class="vux-1px-l"> 
                    <router-link class="tab-act" to='/home/activity/detail/record'>
                        活动印记
                    </router-link>
                    </tab-item>
                <tab-item  class="vux-1px-l">
                     <router-link class="tab-act" to='/home/activity/detail/comment'>
                        活动点评
                    </router-link>
                    </tab-item>
            </tab> 
        </div>
        <div>
        <router-view></router-view> 
        </div>
        <div class="sup-foot">  
            <flexbox :gutter="0">
                <flexbox-item> 
                    <router-link to='' :class="{active: isActive=='1'}"> 
                        <div>
                            <div class="sup-phone">
                                <div class='phone-icon'  v-if="isActive=='1'"><span></span><img src="/static/icon_whitephoto.png" alt=""></div>
                                <div class='phone-icon'  v-if="isActive!='1'"><span></span><img src="/static/icon_phone.png" alt=""></div>
                                <p>电话咨询</p>
                            </div>  
                        </div> 
                    </router-link>
                </flexbox-item>
                <flexbox-item> 
                    <router-link   to='' :class="{ active: isActive=='2'}">  
                        <div class="vux-1px-l"> 
                            <p>在线报名</p> 
                        </div>
                    </router-link>
                </flexbox-item> 
                <flexbox-item> 
                    <div @click="nowCom " :class="{ active: isActive=='3'}">  
                        <div class="vux-1px-l" > 
                            <p>马上评论</p> 
                        </div>
                    </div>
                </flexbox-item> 
            </flexbox> 
        </div> 
        <div v-if='isShow' class='popContainer'> 
            <div class='head'>
                <flexbox :gutter='0'>
                    <flexbox-item :span="1/5" >  
                    <div  class="return" @click='turnUp'>
                        <img src="/static/btn_return.png" alt="">
                    </div> 
                    </flexbox-item>
                    <flexbox-item :span="3/5">  
                        <p class="head-title">成光幼儿园1校</p>
                    </flexbox-item> 
                    <flexbox-item :span="1/5">   
                        <div class='submit' @click='DoSubmit'>
                        提交
                        </div>
                    </flexbox-item> 
                </flexbox> 
            </div>
              <div class='sch-det'>
                <p class='sch-det-title'>南城活力幼儿园</p>
                <div class='sch-det-star'> 
                        <rater  v-model="star" :min="0" :font-size="30" :margin='10' ></rater>  
                </div> 
                <div class='write-com'>  
                    <textarea name="" id="" cols="30" rows="10" placeholder="写下你对活动的评价吧~"></textarea>   
                    </div>
                    <div class='add-pic'>
                        <div class='add-img'> 
                            <img src="/static/btn_grey_picture.png" alt=""> 
                        </div>
                        <p>
                            添加图片
                        </p>
                    </div>
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
        isActive:1,
        isShow:false,
        star:0
    }
  },
  watch:{},
  computed:{},
  methods:{
    switchTabItem (index) {
      console.log('on-before-index-change', index)
      this.$vux.loading.show({
        text: 'loading'
      })
      setTimeout(() => {
        this.$vux.loading.hide()
        this.index01 = index
      }, 1000)
    },
    turnUp(){ 
      this.$router.push('/home/activity');
    },
    DoSubmit(){
        console.log('进');
        this.isShow=!this.isShow
    }, 
    nowCom(){
        console.log('进');
        this.isShow=!this.isShow
    }
    },
  created(){},
  mounted(){}
  
}
</script>
<style lang="less" scoped> 

.sch-det-con{
    margin-bottom:15px;
}
.sch-det-con-item{
    display:inline-block;
    color:#666;
    font-size:12px;
    height:29px;
    line-height: 29px;
    background: #eee;
    padding:0 10px;
    border-radius: 15px;
}
.sch-det-title{
    font-size:16px;
    color:#666;
    line-height:44px;
    border-bottom:1px solid #eee;
}
.sch-det-star{
    text-align: center;
    line-height: 75px;
}
.add-pic{
    margin-top:15px;
    width:75px;
    height:75px;
    border:1px dashed #ccc;
    border-radius: 2px;
}
.add-img{
    width:55px;
    height:50px;
    margin: 0 auto;
}
.add-pic img{
    width:100%;
    height:100%;
}
.add-pic p{
    font-size:12px;
    color:#ccc;
    text-align: center;
}
textarea{
    width:100%;
    height:125px;
    background: #f5f5f5;
    border-radius: 3px;
    border-color:#ccc;
    padding:10px;
    outline:none;
    resize: none;
}

textarea::placeholder{
    color:#ccc;
}
.write-box{
    border:1px solid #ccc;
    background: #f5f5f5;
}
.write-com{
    padding:0 15px;
}
.sch-det{
    padding:0 15px;
    background: #fff; 
    margin-top:130px;
    flex:1;
}
.submit{
    background: #ccc;
    color:#fff;
    width:60px;
    line-height: 29px;
    border-radius: 15px;
    text-align: center;
}
.submit:hover{
    color:#5EE2C6;
    background: #fff;
}
div.popContainer{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    display:flex;
    flex-direction: column; 
}
.vux-1px-l:before{
    top:50%;
    transform: translateY(-13px);
    height:26px;
    border-color:#eee;
  } 
.act-detail{
    background:#EEEEEE;
}
.act-foot,.act-time,.act-support{
    background: #fff;
}
.detial-star{
    margin-left:8px;
    width:22px;
    height:22px;
}
.detial-share{
    width:22px;
    height:22px;
}
.detial-star img,.detial-share img{
    display:block;
    width:100%;
    height:100%;
}

  .act-banner{
      width:100%;
      height:175px; 
  }
  .act-banner img{
      width:100%;
      height:100%; 
  }
  .act-title{
        font-size:16px;
        color:#666;
        line-height: 36px;
        font-weight: normal;
    }
.act-status{
    width:44px;
    height:16px;
    background:#FC4D4D;
    border-radius: 8px;
    float:right;
}
div.act-status>p{ 
    color:#fff;
    font-size: 8px;
    text-align: center;
    line-height: 16px;
}
.act-end{ 
    width:44px;
    height:16px;
    background:#ccc;
    border-radius: 8px;
}
.act-foot{
    padding:5px 15px;
}
  .act-foot p{
  font-size:10px;
  color:#ccc;
}
.act-icon{   
  width:16px;
  height:14px; 
}
.act-icon img{
  width:100%;
  height:100%;
  display:block;
}
.link-title{
    color:#666;
    font-size:14px;
}
.weui-cell:before{ 
    right: 15px;
}
.yuan{
    color:#5EE2C6;
}
.act-time{
    display:flex;
    padding:10px 15px;
    position:relative;
}
.act-time:after{
    content: " ";
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    left: 15px;
    right: 15px;
}
.act-time:before{
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    left: 15px;
    right: 15px;
}
.time-icon{
    width:13px;
    height:46px;  
    text-align: center;
    vertical-align:middle;  
    margin-right:5px;
}
.time-icon img{
    width:100%; 
    vertical-align: middle
} 
.time-icon span{height: 100%;vertical-align: middle;display: inline-block}
.time-title{
    flex:1;
}
.time-title p{
    color:#666;
    font-size:14px;
}
.act-support{
    margin-top:10px;
    padding:15px;
}
.act-support p{
    text-align: center;
}
.sup-icon {
  width: 55px;
  height: 55px; 
  margin: 0 auto;
}
.sup-icon img {
  width: 100%;
  height: 100%;
}
.act-support span{
    color:#666;
    font-size:12px;
}
.sup-nav{
    margin-top:10px;
    background: #fff;
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
  box-shadow: 0px -1px 3px #5EE2C6;
  z-index: 1000;
}
.sup-foot a,.sup-foot p{ 
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
a.active, a.active p{
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