<template>
  <div>
      <c-head> 
        <div slot='left' >
            <div class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div>
        </div>
        <p slot='center' class='user-title'>我的活动</p>   
      </c-head> 
        <div> 
            <tab :line-width="1" custom-bar-width="0"  @on-before-index-change="switchTabItem">
                <tab-item selected >已关注</tab-item>
                <tab-item  class="vux-1px-l">已报名</tab-item> 
            </tab> 
        </div>
        <div> 
            <panel :list="list" type="1" @on-img-error="onImgError">  
            </panel>
        </div>
  </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
         list: [{
        src: '/static/img_institutions03.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '亲子活动',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/component/cell', 
      }, {
        src: '/static/img_institutions03.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '亲子活动',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/component/cell', 
      }, {
        src: '/static/img_institutions03.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '亲子活动',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/component/cell', 
      }, {
        src: '/static/img_institutions03.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '亲子活动',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/component/cell', 
      }, {
        src: '/static/img_institutions03.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '亲子活动',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/component/cell', 
      }, {
        src: '/static/img_institutions03.png',
        fallbackSrc: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '亲子活动',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: '/component/cell', 
      }, {
        src: '/static/img_institutions03.png',
        title: '亲子活动',
        desc: '简介：建筑面积100百万平方米，有独立游泳池',
        url: {
          path: '/component/radio',
          replace: false
        }, 
        meta: {
          source: '来源信息',
          date: '时间',
          other: '其他信息'
        }
      }],
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
      turnUp:function(){
      console.log('进入');
      this.$router.push('/home');
    },onImgError (item, $event) {
      console.log(item, $event)
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
.user-main p{
    font-size:14px;
    color:#666;
}
.outLogin{
    display:block;
    background: #fff;
    color:#F93B3B;
    line-height: 44px;
    font-size:14px;
    text-align: center;
} 
  .vux-1px-l:before{
    top:50%;
    transform: translateY(-14.5px);
    height:25px;
    border-color:#eee;
  }
  .weui-panel:before{
      display:none;
  }
</style>