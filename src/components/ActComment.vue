<template>
<div class="comment-main">
    <router-link  to='/home/activity/userComment' class="comment">  
      <div class="com-img">
          <img src="/static/img_Head01.png" alt="">
      </div>
      <div class="com-box">
          <div class='title-box'>
              <div class="com-user">
                  <p class="com-name">小丝瓜1365550099</p> 
                  <p class="com-date">8月1日</p>
              </div> 
            <div class="sorce-box">
                <p class='sorce'>打分</p>
                <rater v-model="star" :min="3" :font-size="16" :margin='0' ></rater>
            </div>
            </div> 
          <div class='com-con'> 
            <p>如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。
            </p>
            <p style="text-align:right; padding-right:10px;">--爱因斯坦</p>
          </div>
          <div>
              <router-link to='' class="com-all">全文</router-link>
              <div class="pic-box"> 
                <flexbox :gutter="5">
                    <flexbox-item v-for="item in picList" :span='91/283'><div class="com-pic"><img :src="item" alt=""></div></flexbox-item> 
                </flexbox>
              </div>
          </div>
      </div> 
  </router-link>
  <div class="comment">  
      <div class="com-img">
          <img src="/static/img_Head01.png" alt="">
      </div>
      <div class="com-box">
          <div class='title-box'>
              <div class="com-user">
                  <p class="com-name">小丝瓜1365550099</p> 
                  <p class="com-date">8月1日</p>
              </div> 
            <div class="sorce-box">
                <p class='sorce'>打分</p>
                <rater v-model="star" :min="3"  :font-size="16" :margin='0' ></rater>
            </div>
            </div> 
          <div class='com-con'> 
            <p>如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。
            </p>
            <p style="text-align:right; padding-right:10px;">--爱因斯坦</p>
          </div>
          <div>
              <router-link to='' class="com-all">全文</router-link>
              <div class="pic-box"> 
                <flexbox :gutter="5">
                    <flexbox-item v-for="item in picList" :span='91/283'><div class="com-pic"><img :src="item" alt=""></div></flexbox-item> 
                </flexbox>
              </div>
          </div>
      </div> 
  </div> 
  <div> 
    <group :gutter="0">   
        <cell is-link>
            <p slot='title' class="look-more">查看更多</p> 
            <p class='count'>共20条</p>
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
        star:5,
        picList:['/static/img_institutions05.png','/static/img_institutions05.png','/static/img_institutions05.png']
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
.comment-main{
    padding-bottom:3px;
    background: #fff;
}
.look-more{
    color:#666;
    font-size:12px;
}
.count{
    color:#989898;
    font-size:10px;
}
.pic-box{
    margin-top:5px;
}
.com-all{
    color:#3667D7;
    font-size:12px;
}
.com-pic{
    width:91px;
    height:91px;
}
.com-pic img{ 
    width:100%;
    height:100%;
}
.vux-rater{
    display: flex;
}
.vux-rater a{ 
    display:block;
} 
.com-user{
    display:flex; 
}
.title-box{
    padding-bottom:15px;
}
.com-name{
    font-size:12px;
    color:#666;
    flex:1;
}
.sorce-box{
    display:flex;
}
.sorce{
    font-size:12px;
    color:#666;}
.com-date{
    color:#989898;
    font-size:10px;
} 
.comment{
    background: #fff;
    padding:15px;
    display:flex;
    position: relative;
}
.comment:after{
     content: " ";
    position: absolute;
    left: 0;
    bottom: 0; 
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
.com-img{
    width:50px;
    height:50px;
}
.com-img img{
    width:100%;
    height:100%;
    display:block;
}
.com-box{
    padding:10px 0px 0px 10px;
    flex:1;
}
.com-con p{ 
    font-size:12px;
     color:#666;
     line-height: 20px;
}
</style>