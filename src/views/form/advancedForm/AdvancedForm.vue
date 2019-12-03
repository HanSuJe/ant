<template>
  <div>
    <a-card class="card" title="对象定义" :bordered="false">
      <ul class="ulStyle">
          <li style="margin-left:20px;" v-for="(val,index) in dataMes" :key="index">
              <span>{{val.name}}</span>
              <br/>
              <a-input v-model="newDataObj[val.key]" :disabled="val.disabled" style="width:220px;height:34px;margin-top:5px;"/>
          </li>
      </ul>
    </a-card>
    <a-card class="card" title="属性" :bordered="false">
      <a-table
        :columns="columns"
        :dataSource="newDataObj.properties"
        :pagination="false"
        :loading="memberLoading"
      >
        <template v-for="(col, i) in ['name', 'shortname', 'description', 'proclassname', 'lazy', 'searchable', 'sortable']" :slot="col" slot-scope="text, record">
          <a-input
            :key="col"
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            :placeholder="columns[i].title"
            @change="e => handleChange(e.target.value, record.key, col, newDataObj.properties)"
          /> 
          <template v-else>{{ text }}</template>
        </template>
        <template slot="operation" slot-scope="text, record">
          <template v-if="record.editable">
            <span v-if="record.isNew">
              <a @click="saveRow(record)">添加</a>
              <a-divider type="vertical" />
              <a-popconfirm title="是否要删除此行？" @confirm="remove(record.key,newDataObj.properties)">
                <a>删除</a>
              </a-popconfirm>
            </span>
            <span v-else>
              <a @click="saveRow(record)">保存</a>
              <a-divider type="vertical" />
              <a @click="cancel(record)">取消</a>
            </span>
          </template>
          <span v-else>
            <a @click="toggle(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="是否要删除此行？" @confirm="remove(record.key,newDataObj.properties)">
              <a>删除</a>
            </a-popconfirm>
          </span>
        </template>
      </a-table>
      <a-button style="width: 100%; margin-top: 16px; margin-bottom: 8px" type="dashed" icon="plus" @click="newMember(newDataObj.properties)">新增成员</a-button>
    </a-card>
    <a-card class="card" title="关联对象" :bordered="false">
      <a-table
        :columns="columns"
        :dataSource="newDataObj.refobjects"
        :pagination="false"
        :loading="memberLoading"
      >
        <template v-for="(col, i) in ['name', 'shortname', 'description', 'proclassname', 'lazy', 'searchable', 'sortable']" :slot="col" slot-scope="text, record">
          <a-input
            :key="col"
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            :placeholder="columns[i].title"
            @change="e => handleChange(e.target.value, record.key, col, newDataObj.refobjects)"
          />
          <template v-else>{{ text }}</template>
        </template>
        <template slot="operation" slot-scope="text, record">
          <template v-if="record.editable">
            <span v-if="record.isNew">
              <a @click="saveRow(record)">添加</a>
              <a-divider type="vertical" />
              <a-popconfirm title="是否要删除此行？" @confirm="remove(record.key,newDataObj.refobjects)">
                <a>删除</a>
              </a-popconfirm>
            </span>
            <span v-else>
              <a @click="saveRow(record)">保存</a>
              <a-divider type="vertical" />
              <a @click="cancel(record)">取消</a>
            </span>
          </template>
          <span v-else>
            <a @click="toggle(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm title="是否要删除此行？" @confirm="remove(record.key,newDataObj.refobjects)">
              <a>删除</a>
            </a-popconfirm>
          </span>
        </template>
      </a-table>
      <a-button style="width: 100%; margin-top: 16px; margin-bottom: 8px" type="dashed" icon="plus" @click="newMember(newDataObj.refobjects)">新增成员</a-button>
    </a-card>
    <!-- fixed footer toolbar -->
    <footer-tool-bar :style="{ width: isSideMenu() && isDesktop() ? `calc(100% - ${sidebarOpened ? 256 : 80}px)` : '100%'}">
      <a-button type="primary" @click="validate" :loading="loading">提交</a-button>
    </footer-tool-bar>
  </div>
</template>

<script>
import TaskForm from './TaskForm'
import FooterToolBar from '@/components/FooterToolbar'
import { mixin, mixinDevice } from '@/utils/mixin'
import { getObjedefData, updateObjdef } from '@/api/manage'
import { isBoolean } from 'util';
import { setTimeout } from 'timers';
const fieldLabels = {
  name: '对象名称',
  classname: '对象类名',
  mixinObjects: '混合对象',
  valid: 'valid',
  ab: '抽象类',
  proxyclass: 'proxyclass'
}

export default {
  name: 'AdvancedForm',
  mixins: [mixin, mixinDevice],
  components: {
    FooterToolBar,
    TaskForm
  },
  data () {
    return {
      description: '',
      loading: false,
      memberLoading: false,
      dataMes:[
        {
          name:"对象名称",
          disabled:false,
          key:"name"
      },
      {
          name:"对象类名",
          disabled:false,
          key:"classname"
      },
      {
          name:"混合对象",
          disabled:false,
          key:"mixinObjects"
      },
      {
          name:"valid",
          disabled:false,
          key:"valid"
      },
      {
          name:"抽象类",
          disabled:false,
          key:"ab"
      },
      {
          name:"proxyclass",
          disabled:false,
          key:"proxyclass"
      }
      ],
      // table
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '编码',
          dataIndex: 'shortname',
          key: 'shortname',
          scopedSlots: { customRender: 'shortname' }
        },
        {
          title: 'description',
          dataIndex: 'description',
          key: 'description',
          scopedSlots: { customRender: 'description' }
        },
        {
          title: '关联类',
          dataIndex: 'proclassname',
          key: 'proclassname',
          scopedSlots: { customRender: 'proclassname' }
        },
        {
          title: 'lazy',
          dataIndex: 'lazy',
          key: 'lazy',
          scopedSlots: { customRender: 'lazy' }
        },
        {
          title: 'searchable',
          dataIndex: 'searchable',
          key: 'searchable',
          scopedSlots: { customRender: 'searchable' }
        },
        {
          title: 'sortable',
          dataIndex: 'sortable',
          key: 'sortable',
          scopedSlots: { customRender: 'sortable' }
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      errors: [],
      newDataObj:{
        name: "",
        classname: "",
        description: "",
        mixinObjects: null,
        ordercode: "999",
        valid: "",
        ab: "",
        proxyclass: "",
        properties: [],
        refobjects: [],
        links: []
      }
    }
  },
  created(){
    if(this.$route.params.classname){
      getObjedefData(this.$route.params.classname).then(res => {
        for(let i in res){
          if(typeof(res[i]) == "boolean"){
            res[i] = String(res[i]);
          }
        }
        res.properties.map((item,index) => {
          item.key = index;
          item.proclassname = item.objdefine.classname;
          for(let i in item){
            if(typeof(item[i]) == "boolean"){
              item[i] = String(item[i]);
            }
          }
        })
        res.refobjects.map((item,index) => {
          item.key = index;
          item.proclassname = item.objdefine.classname;
          for(let i in item){
            if(typeof(item[i]) == "boolean"){
              item[i] = String(item[i]);
            }
          }
        })
        this.newDataObj = res;
      })
    }
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
    },
    newMember (data) {
      const length = data.length
      data.push({
        key: length === 0 ? '1' : (parseInt(data[length - 1].key) + 1).toString(),
        name: "",
        shortname: "",
        description: "",
        proclassname: "",
        objdefine: {
          name: null,
          classname: "java.lang.String",
          description: null,
          mixinObjects: null,
          ordercode: null,
          valid: false,
          ab: false,
          proxyclass: false,
          properties: [],
          refobjects: []
        },
        lazy: "",
        searchable: "",
        sortable: "",
        editable:true
      })
    },
    remove (key,data) {
      data.map((item, index) => {
        if(item.key == key){
          data.splice(index,1);
        }
      })
    },
    saveRow (record) {
      record.objdefine.classname = record.proclassname;
      this.memberLoading = true
      setTimeout(()=>{
        this.$set(record,"editable",false);
        this.memberLoading = false;
      },800)
    },
    toggle (target) {
      this.$set(target,"editable",true);
    },
    cancel (target) {
      this.$set(target,"editable",false);
    },
    handleChange (value, key, column, data) {
      const newData = [...data];
      const target = newData.filter(item => key == item.key)[0]
      target[column] = value;
      data = newData;
    },
    // 最终全页面提交
    validate () {
      updateObjdef(this.newDataObj.classname,this.newDataObj).then(res => {
        history.go(-1);
      }).catch(() => {
        return this.$message.warning('保存失败!');
      });
    }
  }
}
</script>

<style lang="less" scoped>
  .card{
    margin-bottom: 24px;
  }
  .ulStyle{
    list-style: none;
    display:flex;
    flex-wrap:wrap;
    margin: 0;
    padding: 0;
  }
  .popover-wrapper {
    /deep/ .antd-pro-pages-forms-style-errorPopover .ant-popover-inner-content {
      min-width: 256px;
      max-height: 290px;
      padding: 0;
      overflow: auto;
    }
  }
  .antd-pro-pages-forms-style-errorIcon {
    user-select: none;
    margin-right: 24px;
    color: #f5222d;
    cursor: pointer;
    i {
          margin-right: 4px;
    }
  }
  .antd-pro-pages-forms-style-errorListItem {
    padding: 8px 16px;
    list-style: none;
    border-bottom: 1px solid #e8e8e8;
    cursor: pointer;
    transition: all .3s;

    &:hover {
      background: #e6f7ff;
    }
    .antd-pro-pages-forms-style-errorIcon {
      float: left;
      margin-top: 4px;
      margin-right: 12px;
      padding-bottom: 22px;
      color: #f5222d;
    }
    .antd-pro-pages-forms-style-errorField {
      margin-top: 2px;
      color: rgba(0,0,0,.45);
      font-size: 12px;
    }
  }
</style>
