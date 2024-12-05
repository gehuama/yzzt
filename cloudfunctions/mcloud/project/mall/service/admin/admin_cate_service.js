/**
 * Notes: 活动后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-23 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const util = require('../../../../framework/utils/util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const Cate1Model = require('../../model/cate1_model.js');
const Cate2Model = require('../../model/cate2_model.js');
const ProductModel = require('../../model/product_model.js');

class AdminCateService extends BaseProjectAdminService {

	/************** 分类1 BEGIN ********************* */
	async vouchCate1(id, vouch) {
		vouch = Number(vouch);
		let data = {};
		data.CATE1_VOUCH = vouch;
		await Cate1Model.edit(id, data);
	}

	async sortCate1(id, sort) {
		sort = Number(sort);
		let data = {};
		data.CATE1_ORDER = sort;
		await Cate1Model.edit(id, data);
	}

	async statusCate1(id, status) {
		let data = {
			CATE1_STATUS: status
		}
		await Cate1Model.edit(id, data);

	}

	async getAdminCate1List({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'CATE1_ORDER': 'asc',
			'CATE1_ADD_TIME': 'desc'
		};
		let fields = '*';

		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [{
				CATE1_TITLE: ['like', search]
			},];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					// 按类型
					where.and.CATE1_STATUS = Number(sortVal);
					break;
				case 'vouch': {
					where.and.CATE1_VOUCH = 1;
					break;
				}
			}
		}

		return await Cate1Model.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	async delCate1(id) {
		// 异步删除 
		ProductModel.del({ PRODUCT_CATE_ID: id });

		await Cate2Model.del({ CATE2_CATE1_ID: id });
		return await Cate1Model.del(id);
	}

	async insertCate1({
		title,
		order,
		forms
	}) {
		//是否重复
		let where = {
			CATE1_TITLE: title,
		}
		let cnt = await Cate1Model.count(where);
		if (cnt)
			this.AppError('该分类名称已经存在');


		let data = {};
		data.CATE1_TITLE = title;
		data.CATE1_ORDER = order;

		data.CATE1_OBJ = dataUtil.dbForms2Obj(forms);
		data.CATE1_FORMS = forms;

		let id = await Cate1Model.insert(data);

		return {
			id
		};

	}

	async getCate1Detail(id) {
		let fields = '*';

		let cate1 = await Cate1Model.getOne(id, fields);
		if (!cate1) return null;

		return cate1;
	}

	async editCate1({
		id,
		title,
		order,
		forms }) {

		//是否重复
		let where = {
			CATE1_TITLE: title,
			_id: ['<>', id]
		}
		let cnt = await Cate1Model.count(where);
		if (cnt)
			this.AppError('该分类名称已经存在');

		let data = {};
		data.CATE1_TITLE = title;
		data.CATE1_ORDER = order;
		data.CATE1_OBJ = dataUtil.dbForms2Obj(forms);
		data.CATE1_FORMS = forms;

		ProductModel.edit({ PRODUCT_CATE_ID: id }, { 'PRODUCT_CATE_NAME.0': title })

		return await Cate1Model.edit(id, data);
	}

	async updateCate1Forms({
		id,
		hasImageForms
	}) {
		await Cate1Model.editForms(id, 'CATE1_FORMS', 'CATE1_OBJ', hasImageForms);

	}
	/************** 分类1 END ********************* */


	/************** 分类2 BEGIN ********************* */
	async sortCate2(id, sort) {
		sort = Number(sort);
		let data = {};
		data.CATE2_ORDER = sort;
		await Cate2Model.edit(id, data);
	}

	async statusCate2(id, status) {

		let data = {
			CATE2_STATUS: status
		}
		await Cate2Model.edit(id, data);

	}

	async getAdminCate2List({
		cate1Id,
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'CATE2_ORDER': 'asc',
			'CATE2_ADD_TIME': 'desc'
		};
		let fields = '*';

		let where = {};
		where.and = {
			CATE2_CATE1_ID: cate1Id
		};

		if (util.isDefined(search) && search) {
			where.or = [{
				CATE2_TITLE: ['like', search]
			},];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					// 按类型
					where.and.CATE2_STATUS = Number(sortVal);
					break;
			}
		}

		return await Cate2Model.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	async delCate2(id) {
		let cate2 = await Cate2Model.getOne(id);
		if (!cate2) this.AppError('该二级分类不存在');

		// 异步删除
		ProductModel.del({ PRODUCT_CATE_ID: id });

		// 删除本分类
		await Cate2Model.del(id);

		// 统计一级
		let cnt = await ProductModel.count({ PRODUCT_CATE_ID: cate2.CATE2_CATE1_ID });
		Cate1Model.edit(cate2.CATE2_CATE1_ID, { CATE1_CNT: cnt });

	}

	async insertCate2({
		title,
		cate1Id,
		order,
		forms
	}) {
		//是否重复
		let where = {
			CATE2_TITLE: title,
		}
		let cnt = await Cate2Model.count(where);
		if (cnt)
			this.AppError('该名称已经存在');


		let data = {};
		data.CATE2_CATE1_ID = cate1Id;
		data.CATE2_TITLE = title;
		data.CATE2_ORDER = order;

		data.CATE2_OBJ = dataUtil.dbForms2Obj(forms);
		data.CATE2_FORMS = forms;

		let id = await Cate2Model.insert(data);

		return {
			id
		};

	}

	async getCate2Detail(id) {
		let fields = '*';

		let cate2 = await Cate2Model.getOne(id, fields);
		if (!cate2) return null;

		return cate2;
	}

	async editCate2({
		id,
		title,
		order,
		forms
	}) {

		//是否重复
		let where = {
			CATE2_TITLE: title,
			_id: ['<>', id]
		}
		let cnt = await Cate2Model.count(where);
		if (cnt)
			this.AppError('该科目名称已经存在');

		// 赋值
		let data = {};
		data.CATE2_TITLE = title;
		data.CATE2_ORDER = order;

		data.CATE2_OBJ = dataUtil.dbForms2Obj(forms);
		data.CATE2_FORMS = forms;

		ProductModel.edit({ PRODUCT_CATE_ID: id }, { 'PRODUCT_CATE_NAME.1': title })

		return await Cate2Model.edit(id, data);
	}

	async updateCate2Forms({
		id,
		hasImageForms
	}) {
		await Cate2Model.editForms(id, 'CATE2_FORMS', 'CATE2_OBJ', hasImageForms);

	}
	/************** 分类2 END ********************* */

}

module.exports = AdminCateService;