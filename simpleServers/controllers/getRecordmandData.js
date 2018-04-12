/**
 * Created by liudeyu on 2018/4/4.
 */
'use strict'
var mysql = require("mysql")
const util = require("util")
const DatabaseUtil = require("../util/DatabaseUtils")
const CommonHelpFun = require("../util/CommonHelpUtils")
const RecommendDataHelper = require("../util/RecommondDataHelper")
var allData = [];
const PAGE = "page";
const AUTHEN = "authen";
const ACCOUNT_ID = "account_id";
const reflash_page_count = 300;
const TIME_GAP = 80 * 1000;
const every_page_num = 20;

async function updateData() {
    var selectSql = `select * from toutiao_news  order by behot_time desc limit %s;`;
    selectSql = util.format(selectSql, reflash_page_count + "")
    DatabaseUtil.findNewsData(selectSql).then(function (data) {
        allData = data
        console.log("all result data length is %d", allData.length)
    })

}
setInterval(updateData, TIME_GAP)
// updateData()
async function getRecomendData(ctx, next) {
    console.log("开始处理请求连接为 " + ctx.url)
    ctx.type = "application/json";
    var response = {};
    var querys = ctx.query;
    var page = 0;
    var user_id;
    if (querys) {
        var tmp = querys[PAGE]
        if (CommonHelpFun.isNum(tmp)) {
            page = parseInt(tmp)
        }
        user_id = querys[ACCOUNT_ID]
    }
    response["status"] = "ok"
    var recommendDatas;
    if (user_id) {
        recommendDatas = RecommendDataHelper.getRecommondData({user_id: user_id, timestamp: new Date().getTime()})
    }
    var resultData = []
    if (recommendDatas && recommendDatas.length > 0) {
        resultData.push(recommendDatas)
    }
    if (resultData.length < every_page_num) {
        var leftNum = every_page_num - resultData.length
        if (allData && (page + 1) * leftNum < allData.length) {
            resultData.push(allData.slice(page * leftNum, page * leftNum + leftNum))
        }
    } else {
        resultData = resultData.splice(0, every_page_num)
    }
    response["data"] = resultData
    ctx.body = response
    await next()
}
module.exports = {
    "get /feed/all_news": getRecomendData
}