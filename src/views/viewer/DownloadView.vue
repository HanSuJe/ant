<template>
    <div>
        <a id="down" :href="downUrl" style="display:none;"></a>
        <a-button @click="downLoad" style="display:block;margin:0 auto;margin-top:100px;" type="primary" icon="download" :size="size">Download</a-button>
    </div>
</template>
<script>
    export default {
        name: 'DownloadView',
        data(){
            return{
                size: 'large'
            }
        },
        props:['downUrl'],
        methods: {
            downLoad(){
                var downNode = document.getElementById("down");
                downNode.click();
            }
        }
    }
</script>