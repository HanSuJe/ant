<template>
  <a-locale-provider :locale="locale">
    <div id="app">
      <router-view/>
    </div>
  </a-locale-provider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { AppDeviceEnquire } from '@/utils/mixin'

export default {
  mixins: [AppDeviceEnquire],
  data () {
    return {
      locale: zhCN
    }
  },
  mounted () {

  }
}
</script>
<style>
  #app {
    height: 100%;
    overflow: auto;
  }
  /*滚动条样式*/
  #app::-webkit-scrollbar{/*滚动条整体样式*/
    width: 5px;     /*高宽分别对应横竖滚动条的尺寸*/
    height: 5px;
  }
  #app::-webkit-scrollbar-thumb{/*滚动条里面小方块*/
    border-radius: 10px;
    background: rgba(0,0,0,0.5);
  }
  #app::-webkit-scrollbar-track{/*滚动条里面轨道*/
    border-radius: 10px;
    background: rgba(0,0,0,0.1);
  }
</style>
