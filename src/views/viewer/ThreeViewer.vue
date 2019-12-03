<template>
    <div id="ts">
        <div id="wrapper"></div>
        <div v-show="isShow" id="tsbar"></div>
        <div class="colorPicker" v-show="colorShow">
            <div id="colorHeader">
                <span @click="close">×</span>
            </div>
            <div id="picker"></div>
            <div id="slide"></div>
        </div>
        <ul class="fotter">
            <li>
                <img :src="rotateSrc" title="3D旋转"/>
            </li>
            <li>
                <img :src="translationSrc" title="平移" />
            </li>
            <li>
                <img :src="zoomSrc" title="缩放" />
            </li>
            <li>
                <img :src="roamSrc" title="漫游" />
            </li>
            <li>
                <img :src="deductionSrc" @click="ts" title="推演" />
            </li>
            <li>
                <img :src="materialSrc" title="材料" />
            </li>
            <li>
                <img :src="detailedSrc" title="清单" />
            </li>
            <li>
                <img :src="cwpSrc" title="CWP" />
            </li>
            <li>
                <img :src="progressSrc" title="进度曲线" />
            </li>
            <li>
                <img :src="modelSrc" title="模型浏览器" />
            </li>
            <li>
                <img :src="fullScreenSrc" title="全屏" />
            </li>
            <li>
                <img :src="homeSrc" title="返回" />
            </li>
        </ul>
        <div class="left_top">
            <ul class="top">
                <li>
                    <img :src="playSrc" @click="play" title="播放" />
                </li>
                <li>
                    <img :src="settingSrc" title="设置" />
                </li>
                <li>
                    <img :src="deductionSrc" @click="ts" title="推演" />
                </li>
            </ul>
            <div class="setting">
                <p>设置</p>
                <p>
                    <a-icon class="arrow" type="caret-right" style="cursor: pointer;" @click="godown(0)" />
                    推演
                </p>
                <ul class="tab">
                    <li>
                        <input type="checkbox" name="vehicle" checked value="display" />
                        <span>默认显示</span>
                        <span id="color_one" @click="showColor('color_one')"></span>
                    </li>
                    <li>
                        <input type="checkbox" name="vehicle" checked value="start" />
                        <span>安装开始</span>
                        <span id="color_two" @click="showColor('color_two')"></span>
                    </li>
                    <li>
                        <input type="checkbox" name="vehicle" checked value="end" />
                        <span>安装完成</span>
                        <span id="color_three" @click="showColor('color_three')"></span>
                    </li>
                </ul>
                <p>
                    <a-icon class="arrow" type="caret-right" style="cursor: pointer;" @click="godown(1)" />
                    预警
                </p>
                <ul class="tab">
                    <li>
                        <input type="checkbox" name="vehicle" checked value="display" />
                        <span>进度预警</span>
                        <span id="color_four" @click="showColor('color_four')"></span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name:'ThreeViewer',
        data(){
            return{
                epcSocket: {},
                isShow: false,
                colorShow: false,
                hex: '',
                id: '',
                homeSrc: require("../../assets/icons/home.svg"),
                fullScreenSrc: require("../../assets/icons/fullScreen.svg"),
                settingSrc: require("../../assets/icons/setting.svg"),
                characteristicSrc: require("../../assets/icons/characteristic.svg"),
                modelSrc: require("../../assets/icons/model.svg"),
                progressSrc: require("../../assets/icons/progress.svg"),
                cwpSrc: require("../../assets/icons/CWP.svg"),
                detailedSrc: require("../../assets/icons/detailed.svg"),
                materialSrc: require("../../assets/icons/material.svg"),
                deductionSrc: require("../../assets/icons/deduction.svg"),
                roamSrc: require("../../assets/icons/roam.svg"),
                zoomSrc: require("../../assets/icons/zoom.svg"),
                translationSrc: require("../../assets/icons/translation.svg"),
                rotateSrc: require("../../assets/icons/rotate.svg"),
                playSrc: require("../../assets/icons/play.svg")
            }
        },
        props:["uid"],
        mounted(){
            ColorPicker(
                document.getElementById('slide'),
                document.getElementById('picker'),
                (hex)=>{
                    document.getElementById(this.id).style.backgroundColor = hex;
                    document.getElementById("colorHeader").style.background = hex;
                }
            );
        },
        watch: {
            uid: {
                handler(){
                    let epcSocket = new EPCViewer();
                    epcSocket.setSocket("localhost:9090/vsfsocket");
                    epcSocket.clearAll();
                    epcSocket.setAmbient(5);
                    epcSocket.listener("onConnected",() => {
                        $("#wrapper").html("");
                        epcSocket.to($("#wrapper"));
                        epcSocket.debug.xyz(true);
                        epcSocket.setStore("dw");
                        epcSocket.send(`test,${this.uid}`);
                        this.epcSocket = epcSocket;
                    }).listener("onSceneRightClick",(epc,node,m) => {
                        if(node){
                            let uuid = node.extensions().uuid;
                            this.$emit("showMenu", uuid);
                        }
                    }).listener("onSceneClick",(epc,node,m) => {
                        if(node){
                            epc.clearAll();
                            node.highLight();
                        }
                    }).listener("onModelLoaded",(viewer) => {
                        this.isShow = false;
                    });
                },
                deep: true,
                immediate: true
            }
        },
        methods:{
            ts(){
                this.isShow = true;
                $("#tsbar").html("");
                this.epcSocket.ts($("#tsbar"));
                this.epcSocket.setType("ts");
                this.epcSocket.send(`test,${this.uid}`);
            },
            play(){
                this.epcSocket.tsPlay();
            },
            stop(){
                this.epcSocket.tsStop();
            },
            godown(id){
                let node = document.querySelectorAll('.arrow');
                let tabArr = document.querySelectorAll('.tab');
                if(node[id].className.indexOf("active") > -1){
                    node[id].classList.remove("active");
                    tabArr[id].classList.remove("active");
                }else{
                    node[id].classList.add("active");
                    tabArr[id].classList.add("active");
                }
            },
            showColor(id){
                this.id = id;
                this.colorShow = true;
            },
            close(){
                this.colorShow = false;
            }
        }
    }
</script>
<style scoped>
    li{
        list-style: none;
    }
    #ts{
        width: 100%;
        overflow: hidden !important;
        position: relative;
    }
    #wrapper{
        width:100%;
        height:55em;
        border:1px solid #cecece;
    }
    #tsbar{
        margin: 0 auto;
        margin-top: 5px;
        width: 80%;
        height: 50px;
    }
    .fotter{
        margin: 0 auto;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #11111186;
        border-radius: 10px;
        height: 50px;
        padding: 0 0 !important;
    }
    .fotter li{
        width: 30px;
        margin-right: 10px;
        cursor: pointer;
    }
    .fotter li img, .top li img{
        vertical-align: middle;
        width: 100%;
    }
    .fotter li img:hover, .top li img:hover{
        filter: drop-shadow(0 0 5px #FFFFFF)
    }
    .setting{
        color: #FFFFFF;
        width: 100%;
        padding-left: 10px;
    }
    .arrow{
        transition: all 0.5s;
    }
    .arrow.active{
        transform: rotate(90deg);
    }
    .tab{
        padding-left: 10px;
        display: none;
    }
    .tab li span{
        display: inline-block;
    }
    .tab li span:nth-child(2){
        margin-left: 10px;
    }
    .tab.active{
        display: block;
    }
    #color_one,#color_two,#color_three,#color_four{
        width: 10px;
        height: 10px;
        background-color: red;
        margin-left: 20px;
        cursor: pointer;
    }
    #colorHeader{
        width:230px;
        height:35px;
        line-height:35px;
        text-align:right;
        padding-right:10px;
        border-radius:10px 10px 0 0;
        border-bottom:none;
        background-color: aquamarine;
    }
    #colorHeader span{
        cursor: pointer;
        float:right;
        font-size:30px;
        transition: all 0.5s;
    }
    #colorHeader span:hover{
        color: red;
    }
    .colorPicker{
        width: 230px;
        position: absolute;
        top: 0;
        left: 15%;
    }
    #picker { 
        width: 200px;
        height: 200px;
        float: left;
    }
    #slide {
        width: 30px;
        height: 200px;
        float: right;
    }
    .top{
        padding: 0 0 !important;
        width: 100%;
        height: 30px;
        display: flex;
        justify-content: space-around;
        margin: 0;
    }
    .top li{
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
    .left_top{
        width: 15%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #11111186;
        border-radius: 10px;
    }
</style>