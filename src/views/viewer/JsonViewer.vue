<template>
    <div>
        <pre>{{viewData}}</pre>
    </div>
</template>
<script>
    export default {
        name:'JsonViewer',
        data(){
            return{
                viewData: ''
            }
        },
        props:['rel_href'],
        watch: {
            rel_href: {
                handler(){
                    this.axios.get(this.rel_href).then(res => {
                        this.viewData = JSON.stringify(res, null, '\t');
                    })
                },
                deep: true,
                immediate: true
            }
        }
    }
</script>
<style scoped>
</style>