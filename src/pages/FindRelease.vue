<template>
  <div class='find-re'>
      <c-head>
            <div slot='left'> 
                <div  class="return" @click='turnUp'>
                    <img src="/static/btn_return.png" alt="">
                </div>
            </div> 
            <div slot='right'>  
                <router-link to=''><p class='search'>发布</p> </router-link>  
            </div> 
         </c-head> 
         <div class='write-com'>  
                <textarea name="" id="" cols="30" rows="10" placeholder="写下你对活动的评价吧~"></textarea>   
                </div>
        <div class='add-pic'> 
                <img src="/static/btn_grey_increase.png" alt="">  
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
      turnUp(){
          this.$router.go(-1)
      }
  },
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.add-pic{
    margin-top:15px;
    width:75px;
    height:75px; 
    border-radius: 2px;
    margin-left:15px;
} 
.add-pic img{
    width:100%;
    height:100%;
}
.find-re{
    height:100%;
    background: #fff;
}
textarea{
    width:100%;
    height:125px; 
    border-radius: 3px;
    border:none; 
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
    padding:15px;
}
.search{ 
  color: #fff;
  font-size: 18px; 
  line-height:29px;
}
</style>