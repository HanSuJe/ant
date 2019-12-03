<template>
  <div class="logo">
    <router-link :to="{name:'dashboard'}">
      <img :src="logo"/>
      <h1 v-if="showTitle">{{ title }}</h1>
    </router-link>
  </div>
</template>

<script>
import LogoSvg from '@/assets/logo.svg?inline'

export default {
  name: 'Logo',
  data(){
    return{
      logo: require('@/assets/logo_w_192.png')
    }
  },
  components: {
    LogoSvg
  },
  props: {
    title: {
      type: String,
      default: 'VSF',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>
