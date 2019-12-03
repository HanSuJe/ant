<template>
  <a-modal
    title="新建"
    :width="640"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          v-show="item.type == 'text'"
          v-for="item in data"
          :key="item.key"
          :label="item.name"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-model="item.value" />
        </a-form-item>
        <a-form-item
          v-show="item.type == 'select'"
          v-for="item in data"
          :key="'^'+item.key"
          :label="item.name"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-select v-if="item.mode == 'default' ? true : false" v-model="item.value">
            <a-select-option v-for="val in item.data" :key="val">{{val}}</a-select-option>
          </a-select>
          <a-select v-if="item.mode == 'multiple' ? true : false" :mode="item.mode" @change="handlehange">
            <a-select-option v-for="val in item.data" :key="val">{{val}}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>
<script>
export default {
  data () {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      data: this.PopupData,
    }
  },
  props:["PopupData"],
  methods: {
    handlehange(value){
      this.data.map(item => {
        if(item.key == "viewers"){
          item.value = String(value)
        }
      })
    },
    add () {
      this.visible = true
    },
    handleSubmit () {
      let newObj = {key:new Date().getTime()};
      this.data.map(item => {
        newObj[item.key] = item.value
      })
      for(let i in newObj){
        if(newObj[i].length == 0){
          return this.$message.warning('请补全信息！');
        }
      }
      this.confirmLoading = true
      setTimeout(() => {
        this.$emit("addProject",newObj)
        this.visible = false
        this.confirmLoading = false
      }, 1500)
      this.data.map(item => {
        item.value = '';
      })
    },
    handleCancel () {
      this.visible = false
    }
  }
}
</script>
