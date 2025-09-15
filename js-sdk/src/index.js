/**
 * Mini Debug SDK - 入口文件
 * 网络请求拦截和调试工具
 */

import { ApolloSecurityTester, init, start, stop, getInstance } from './core/index.js'

// 导出主要 API
export { ApolloSecurityTester, init, start, stop, getInstance }

// 默认导出
export default ApolloSecurityTester

// 全局注册（可选）
if (typeof window !== 'undefined') {
  // 新的全局名
  window.ApolloSecurityTester = ApolloSecurityTester
  window.apolloSecurityTester = {
    init,
    start,
    stop,
    getInstance
  }
}
