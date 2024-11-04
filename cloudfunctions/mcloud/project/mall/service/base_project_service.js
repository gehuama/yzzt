﻿/**
 * Notes: 业务基类 
 * Date: 2021-03-15 04:00:00 
 */

const dbUtil = require('../../../framework/database/db_util.js');
const util = require('../../../framework/utils/util.js');
const AdminModel = require('../../../framework/platform/model/admin_model.js');
const ProductModel = require('../model/product_model.js');
const NewsModel = require('../model/news_model.js');
const ActivityModel = require('../model/activity_model.js');
const Cate1Model = require('../model/cate1_model.js');
const BaseService = require('../../../framework/platform/service/base_service.js');

class BaseProjectService extends BaseService {
	getProjectId() {
		return util.getProjectId();
	}

	async initSetup() {

		let F = (c) => 'bx_' + c;
		const INSTALL_CL = 'setup_mall';
		const COLLECTIONS = ['setup', 'admin', 'log', 'info', 'cate1', 'cate2', 'fav', 'user', 'product', 'comment', 'activity', 'activity_join', 'news'];
		const CONST_PIC = '/images/cover.gif';


		const PRODUCT_CATE1 = '1=业态1,2=业态2,3=业态3,4=业态4';
		const NEWS_CATE = '1=通知公告';
		const ACTIVITY_CATE = '1=活动';


		if (await dbUtil.isExistCollection(F(INSTALL_CL))) {
			return;
		}

		console.log('### initSetup...');

		let arr = COLLECTIONS;
		for (let k = 0; k < arr.length; k++) {
			if (!await dbUtil.isExistCollection(F(arr[k]))) {
				await dbUtil.createCollection(F(arr[k]));
			}
		}

		if (await dbUtil.isExistCollection(F('admin'))) {
			let adminCnt = await AdminModel.count({});
			if (adminCnt == 0) {
				let data = {};
				data.ADMIN_NAME = 'admin';
				data.ADMIN_PASSWORD = 'e10adc3949ba59abbe56e057f20f883e';
				data.ADMIN_DESC = '超管';
				data.ADMIN_TYPE = 1;
				await AdminModel.insert(data);
			}
		}


		if (await dbUtil.isExistCollection(F('news'))) {
			let newsCnt = await NewsModel.count({});
			if (newsCnt == 0) {
				let newsArr = NEWS_CATE.split(',');
				for (let j in newsArr) {
					let title = newsArr[j].split('=')[1];
					let cateId = newsArr[j].split('=')[0];

					let data = {};
					data.NEWS_TITLE = title + '标题1';
					data.NEWS_DESC = title + '简介1';
					data.NEWS_CATE_ID = cateId;
					data.NEWS_CATE_NAME = title;
					data.NEWS_CONTENT = [{ type: 'text', val: title + '内容1' }];
					data.NEWS_PIC = [CONST_PIC];

					await NewsModel.insert(data);
				}
			}
		}

		if (await dbUtil.isExistCollection(F('cate1'))) {
			let cate1Cnt = await Cate1Model.count({});
			if (cate1Cnt == 0) {
				let cate1Arr = PRODUCT_CATE1.split(',');
				for (let j in cate1Arr) {
					let title = cate1Arr[j].split('=')[1];
					let cateId = cate1Arr[j].split('=')[0];

					let data = {};
					data._id = cateId;
					data.CATE1_TITLE = title;
					data.CATE1_OBJ = {
						cover: [CONST_PIC]
					}

					await Cate1Model.insert(data);
				}
			}
		}


		if (await dbUtil.isExistCollection(F('product'))) {
			let productCnt = await ProductModel.count({});
			if (productCnt == 0) {
				let productArr = PRODUCT_CATE1.split(',');
				for (let j in productArr) {
					let title = productArr[j].split('=')[1];
					let cateId = productArr[j].split('=')[0];

					let data = {};
					data.PRODUCT_TITLE = title + '店铺标题1';
					data.PRODUCT_CATE_ID = [cateId];
					data.PRODUCT_CATE_NAME = title;
					data.PRODUCT_OBJ = {
						cover: [CONST_PIC],
						logo: [CONST_PIC]
					}

					await ProductModel.insert(data);
				}
			}
		}

		if (await dbUtil.isExistCollection(F('activity'))) {
			let activityCnt = await ActivityModel.count({});
			if (activityCnt == 0) {
				let activityArr = ACTIVITY_CATE.split(',');
				for (let j in activityArr) {
					let title = activityArr[j].split('=')[1];
					let cateId = activityArr[j].split('=')[0];

					let data = {};
					data.ACTIVITY_TITLE = title + '1';
					data.ACTIVITY_CATE_ID = cateId;
					data.ACTIVITY_CATE_NAME = title;
					data.ACTIVITY_ADDRESS = '湖南省长沙市岳麓山';
					data.ACTIVITY_START = this._timestamp;
					data.ACTIVITY_END = this._timestamp + 86400 * 1000 * 30;
					data.ACTIVITY_STOP = this._timestamp + 86400 * 1000 * 30;
					data.ACTIVITY_JOIN_FORMS = [
						{ type: 'text', title: '姓名', must: true },
						{ type: 'mobile', title: '手机', must: true }
					];
					data.ACTIVITY_OBJ = {
						cover: [CONST_PIC],
						img: [CONST_PIC],
						time: 3,
						fee: '100',
						desc: [{ type: 'text', val: title + '1详情介绍' }]
					};

					await ActivityModel.insert(data);
				}
			}
		}


		if (!await dbUtil.isExistCollection(F(INSTALL_CL))) {
			await dbUtil.createCollection(F(INSTALL_CL));
		}
	}

}

module.exports = BaseProjectService;