<template>
  <div class='mine'> 
    <div class='mine-head'>
      <p class="mine-title">我的</p> 
      <router-link class='mine-mes-box' to='/mine/user'>
        <div class='mine-img'><img src="/static/img_Head.png" alt=""></div>
        <p>西瓜</p>
      </router-link>
      <div>
        <div> 
          <flexbox :gutter='0'>
            <flexbox-item><div class="mine-nav"> 
                <div class="mine-icon"><img src="/static/btn_numerical.png" alt=""></div>
                <p>关爱值</p>
              </div>
            </flexbox-item>  
            <flexbox-item><div class="mine-nav vux-1px-l"> 
                <div class="mine-icon"><img src="/static/btn_area.png" alt=""></div>
                <p>区域排行</p>
              </div>
            </flexbox-item>  
            <flexbox-item><div class="mine-nav vux-1px-l"> 
                <div class="mine-icon"><img src="/static/btn_family.png" alt=""></div>
                <p>家族排行</p>
              </div>
            </flexbox-item> 
          </flexbox>
        </div> 
      </div>
    </div>
    <div class='mine-main'>
      <group :gutter='8'> 
        <cell link='/mine/school'>
          <p slot='title'>关注学校</p>
          <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/icon_collection.png">
        </cell> 
        <cell link='/mine/act' is-link>
          <p slot='title'>活动报名</p>
          <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/icon_signup.png">
        </cell>
        <cell link='' is-link>
          <p slot='title'>宝宝脚印</p>
          <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/icon_foot.png">
        </cell> 
      </group>
       <group :gutter='10'>  
        <cell link='/mine/set' is-link> 
          <p slot='title'>设置</p>
          <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/icon_Set.png">
        </cell> 
      </group>
    </div> 
  </div>
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {};
  },
  watch: {},
  computed: {},
  methods: {
    onIndexChange(newIndex, oldIndex) {
      console.log(newIndex, oldIndex);
    }
  },
  created() {},
  mounted() {}
};
</script>
<style scoped> 
.mine-main>div>div::before{
  border-top:transparent;
}
.mine-main>div>div::after{
  border-top:transparent;
}
.mine-head {
  height: 290px;
  padding: 20px 15px 10px;
  background: linear-gradient(#A1FED6, #13C3B5);
  text-align: center;
  color: #fff;
}
.mine-mes-box{
  display:block;
  color: #fff;
}
.mine-title {
  margin-top: 10px;
  font-size: 18px;
  line-height: 20px;
}
.mine-mes-box {
  padding: 25px 0;
}
.mine-img {
  width: 100px;
  height: 100px;
  vertical-align: middle;
  margin: 0 auto;
}
.mine-img img,.mine-icon img {
  width: 100%;
  height: 100%;
} 
.mine-icon{
  width:25px;
  height:25px;
  margin:0 auto;
  vertical-align: top;
}
.vux-1px-l:before{
    top:50%;
    transform: translateY(-13px);
    height:26px;
    border-color:#fff;
  }
.mine-nav p{
  text-align: center;
  font-size:14px;
  margin-top:5px;
}
.mine-main p{
  font-size:14px;
  color:#666;
}
.weui-cells::before,.weui-cells::after{
  border:none;
}
</style>