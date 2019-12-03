export default {
  primaryColor: '#1890FF',
  navTheme: 'dark',
  layout: 'sidemenu',
  contentWidth: 'Fixed',
  fixedHeader: true,
  fixSiderbar: true,
  autoHideHeader: true,
  colorWeak: false,
  multiTab: false,
  production: process.env.NODE_ENV === 'production' && process.env.VUE_APP_PREVIEW !== 'true',
  storageOptions: {
    namespace: 'pro__',
    name: 'ls',
    storage: 'local',
  }
}