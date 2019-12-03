<template>
    <div id="box"></div>
</template>
<script>
    export default {
        name: "DxfView",
        data(){
            return{

            }
        },
        props:['downUrl'],
        watch: {
            downUrl: {
                handler(){
                    this.axios.get(this.downUrl).then(res => {
                        let cadCanvas;
                        var font;
                        var parser = new window.DxfParser();
                        var dxf = parser.parseSync(res);
                        var loader = new THREE.FontLoader();
                        loader.load('fonts/helvetiker_regular.typeface.json', function ( response ) {
                            font = response;
                            cadCanvas = new ThreeDxf.Viewer(dxf, document.getElementById('box'), 1200, 750, font);
                        });
                    })
                },
                immediate: true
            }
        }
    }
</script>
<style scoped>

</style>