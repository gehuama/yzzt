/*
 * @Author: 马雄伟 xiongwei.ma@dyness-tech.com
 * @Date: 2024-11-04 17:02:55
 * @LastEditors: 马雄伟 xiongwei.ma@dyness-tech.com
 * @LastEditTime: 2024-11-04 19:44:22
 * @FilePath: \yzzt\miniprogram\setting\setting.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
	//### 环境相关 
	CLOUD_ID: 'yzzt-1gv2jtms28bc42e0', //云服务id ,本地测试环境 

	// #### 版本信息 
	VER: 'build 2023.10.01',
	COMPANY: '联系作者',

	// #### 系统参数 
	IS_SUB: false, //分包模式 
	IS_DEMO: false, //是否演示版  

	MOBILE_CHECK: false, //手机号码是否真实性校验


	//#################     
	IMG_UPLOAD_SIZE: 20, //图片上传大小M兆    

	// #### 缓存相关
	CACHE_IS_LIST: true, //列表是否缓存
	CACHE_LIST_TIME: 60 * 30, //列表缓存时间秒    

}