/**
 * Notes: 资讯后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-07-11 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const util = require('../../../../framework/utils/util.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const ProductModel = require('../../model/product_model.js');
const Cate1Model = require('../../model/cate1_model.js');
const Cate2Model = require('../../model/cate2_model.js');
const pinyin = require('../../public/pinyin.js');

class AdminProductService extends BaseProjectAdminService {



	async statCate1Cnt(id) {
		if (!id) return;
		let cnt = await ProductModel.count({ PRODUCT_CATE_ID: id });
		await Cate1Model.edit(id, { CATE1_CNT: cnt });
	}

	async statCate2Cnt(id) {
		if (!id) return;
		let cnt = await ProductModel.count({ PRODUCT_CATE_ID: id });
		await Cate2Model.edit(id, { CATE2_CNT: cnt });
	}

	/**添加店铺*/
	async insertProduct({
		title,
		cateId, //分类 
		cateName,
		first,
		order,
		forms
	}) {


		// 重复性判断
		let where = {
			PRODUCT_TITLE: title,
		}
		if (await ProductModel.count(where))
			this.AppError('该标题已经存在');

		// 赋值 
		let data = {};
		data.PRODUCT_TITLE = title;
		data.PRODUCT_CATE_ID = cateId;
		data.PRODUCT_CATE_NAME = cateName;
		data.PRODUCT_ORDER = order;
		data.PRODUCT_FIRST = first.toUpperCase() || pinyin.getFirst(title);

		data.PRODUCT_OBJ = dataUtil.dbForms2Obj(forms);
		data.PRODUCT_FORMS = forms;

		let id = await ProductModel.insert(data);

		let qr = await this.genDetailQr('product', id);
		ProductModel.edit(id, { PRODUCT_QR: qr });

		// 异步统计
		this.statCate1Cnt(cateId[0]);
		this.statCate2Cnt(cateId[1]);

		return {
			id
		};
	}

	/**删除资讯数据 */
	async delProduct(id) {

		// 取出图片数据
		let product = await ProductModel.getOne(id, '*');
		if (!product) return;

		await ProductModel.del(id);

		// 异步删除图片  
		cloudUtil.deleteFiles(product.PRODUCT_OBJ.cover[0]);

		// 处理 新旧文件 
		cloudUtil.handlerCloudFilesForForms(product.PRODUCT_FORMS, []);
		cloudUtil.deleteFiles(product.PRODUCT_QR);

		// 异步统计
		this.statCate1Cnt(product.PRODUCT_CATE_ID[0]);
		this.statCate2Cnt(product.PRODUCT_CATE_ID[1]);

	}

	/**获取资讯信息 */
	async getProductDetail(id) {
		let fields = '*';

		let where = {
			_id: id
		}
		let product = await ProductModel.getOne(where, fields);
		if (!product) return null;

		return product;
	}

	// 更新forms信息
	async updateProductForms({
		id,
		hasImageForms
	}) {
		await ProductModel.editForms(id, 'PRODUCT_FORMS', 'PRODUCT_OBJ', hasImageForms);

	}


	/**更新资讯数据 */
	async editProduct({
		id,
		title,
		cateId, //分类 
		cateName,
		first,
		order,
		forms
	}) {

		// 重复性判断
		let where = {
			PRODUCT_TITLE: title,
			_id: ['<>', id]
		}
		if (await ProductModel.count(where))
			this.AppError('该标题已经存在');

		// 异步处理 新旧文件
		let product = await ProductModel.getOne(id, 'PRODUCT_FORMS,PRODUCT_CATE_ID');
		if (!product) return;
		cloudUtil.handlerCloudFilesForForms(product.PRODUCT_FORMS, forms);


		// 赋值 
		let data = {};
		data.PRODUCT_TITLE = title;
		data.PRODUCT_CATE_ID = cateId;
		data.PRODUCT_CATE_NAME = cateName;
		data.PRODUCT_ORDER = order;
		data.PRODUCT_FIRST = first.toUpperCase() || pinyin.getFirst(title);

		data.PRODUCT_OBJ = dataUtil.dbForms2Obj(forms);
		data.PRODUCT_FORMS = forms;

		await ProductModel.edit(id, data);

		// 小程序码
		let qr = await this.genDetailQr('product', id);
		ProductModel.edit(id, { PRODUCT_QR: qr });

		// 异步统计
		this.statCate1Cnt(product.PRODUCT_CATE_ID[0]);
		this.statCate2Cnt(product.PRODUCT_CATE_ID[1]);
		this.statCate1Cnt(cateId[0]);
		this.statCate2Cnt(cateId[1]);

	}

	/**取得资讯分页列表 */
	async getAdminProductList({
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
			'PRODUCT_ORDER': 'asc',
			'PRODUCT_ADD_TIME': 'desc'
		};
		let fields = 'PRODUCT_VIEW_CNT,PRODUCT_LIKE_CNT,PRODUCT_FAV_CNT,PRODUCT_COMMENT_CNT,PRODUCT_CATE_NAME,PRODUCT_TITLE,PRODUCT_CATE_ID,PRODUCT_CATE_NAME,PRODUCT_EDIT_TIME,PRODUCT_ADD_TIME,PRODUCT_ORDER,PRODUCT_STATUS,PRODUCT_CATE2_NAME,PRODUCT_VOUCH,PRODUCT_QR,PRODUCT_OBJ.cover,PRODUCT_OBJ.star';

		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [
				{ PRODUCT_TITLE: ['like', search] },
				{ PRODUCT_CATE_NAME: ['like', search] },
			];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.PRODUCT_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.PRODUCT_STATUS = Number(sortVal);
					break;
				}
				case 'vouch': {
					where.and.PRODUCT_VOUCH = 1;
					break;
				}
				case 'top': {
					where.and.PRODUCT_ORDER = 0;
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'PRODUCT_ADD_TIME');
					break;
				}

			}
		}

		let ret = await ProductModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);

		const CateService = require('../cate_service.js');
		let cateService = new CateService();
		ret.cateList = await cateService.getAllCateOptions();

		return ret;
	}

	/**修改资讯状态 */
	async statusProduct(id, status) {
		let data = {
			PRODUCT_STATUS: status
		}
		let where = {
			_id: id,
		}

		return await ProductModel.edit(where, data);
	}

	/**置顶与排序设定 */
	async sortProduct(id, sort) {
		sort = Number(sort);
		let data = {};
		data.PRODUCT_ORDER = sort;
		await ProductModel.edit(id, data);
	}

	async vouchProduct(id, vouch) {
		vouch = Number(vouch);
		let data = {};
		data.PRODUCT_VOUCH = vouch;
		await ProductModel.edit(id, data);
	}
}

module.exports = AdminProductService;