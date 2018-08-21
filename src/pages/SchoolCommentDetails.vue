<template>
  <div class='com-detail'> 
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
                <div class='submit'>
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
          <div class='sch-det-con-list'> 
                <flexbox :gutter='0' wrap='wrap'>
                    <flexbox-item :span='1/3' v-for='item in list'>
                        <div :class="{'sch-det-con':true}">
                            <a class='sch-det-con-item'> 
                                {{item}}
                            </a>
                        </div>
                </flexbox-item> 
                </flexbox> 
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
                </flexbox-item> <flexbox-item> 
                    <router-link to='/school/commentDetails' :class="{ active: isActive=='3'}">  
                        <div class="vux-1px-l"> 
                            <p>马上评论</p> 
                        </div>
                    </router-link>
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
        star:0,
        isActive:1,
        list:['环境优雅','老师超赞','体验超级棒','服务热情','高大上','干净卫生','性价比高','交通方便']
    }
  },
  watch:{},
  computed:{},
  methods:{ turnUp:function(){ 
      this.$router.go(-1);
    }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.com-detail{
    height:100%;
    background: #fff;
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
}
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
</style>