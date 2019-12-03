import { axios } from '@/utils/request'

const api = {
  user: '/user',
  role: '/role',
  service: '/service',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree',
  //my-vsf-projectlist-api
  projectUrl: '/projectes/test',
  //my-vsf-objdef-api
  objdefUrl: '/objdef/test',
  //my-vsf-nodetype-api
  nodeTypeUrl: '/nodetype/test',
  //my-vsf-datatree-api
  dataTreeUrl: '/dt/test',
  //my-vsf-viewer-api
  viewerUrl: '/viewer/test'
}

export default api

//my-vsf-projectlist-api
export function getProjectList(){
  return axios({
    url: api.projectUrl,
    method: 'get'
  })
}
export function updateProject(projectCode,target){
  return axios({
    url: `${api.projectUrl}/${projectCode}`,
    method: 'post',
    data: target
  })
}
export function deleteProject(projectCode){
  return axios({
    url: `${api.projectUrl}/${projectCode}`,
    method: 'delete'
  })
}
//my-vsf-objdef-api
export function getObjdef(){
  return axios({
    url: api.objdefUrl,
    method: 'get'
  })
}
export function getObjedefData(classname){
  return axios({
    url: `${api.objdefUrl}/${classname}.df`,
    method: 'get'
  })
}
export function addObjdef(target){
  return axios({
    url: `${api.objdefUrl}.df`,
    method: 'post',
    data: target
  })
}
export function updateObjdef(classname,target){
  return axios({
    url: `${api.objdefUrl}/${classname}.df`,
    method: 'post',
    data: target
  })
}
export function deleteObjdef(classname){
  return axios({
    url: `${api.projectUrl}/${classname}.df`,
    method: 'delete'
  })
}
//my-vsf-nodetype-api
export function getNodeType(){
  return axios({
    url: api.nodeTypeUrl,
    method: 'get'
  })
}
export function addNodeType(target){
  return axios({
    url: `${api.nodeTypeUrl}.nt`,
    method: 'post',
    data: target
  })
}
export function updateNodeType(classname,target){
  return axios({
    url: `${api.nodeTypeUrl}/${classname}.nt`,
    method: 'post',
    data: target
  })
}
export function deleteNodeType(classname){
  return axios({
    url: `${api.nodeTypeUrl}/${classname}.nt`,
    method: 'delete'
  })
}
//my-vsf-datatree-api
export function getDataTree(){
  return axios({
    url: api.dataTreeUrl,
    method: 'get'
  })
}
//my-vsf-viewer-api
export function getViewer(){
  return axios({
    url: api.viewerUrl,
    method: 'get'
  })
}
export function getViewerData(code){
  return axios({
    url: `${api.viewerUrl}/${code}`,
    method: 'get'
  })
}
export function updateViewer(code,target){
  return axios({
    url: `${api.viewerUrl}/${code}`,
    method: 'post',
    data: target
  })
}
export function deleteViewer(code){
  return axios({
    url: `${api.viewerUrl}/${code}`,
    method: 'delete'
  })
}




export function getUserList (parameter) {
  return axios({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList (parameter) {
  return axios({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList (parameter) {
  return axios({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return axios({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return axios({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return axios({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}
