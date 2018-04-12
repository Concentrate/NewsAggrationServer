/**
 * Created by liudeyu on 2018/4/10.
 */
'use strict'
const ComonHelpUtil = require("../util/CommonHelpUtils")
const mysql = require("mysql")
const DatabaseUtil = require("../util/DatabaseUtils")
const util = require("util")
var needToUpdateData = []
const REFLASH_GAP = 30 * 1000;
const AUTHEN = "authen";
const ACCOUNT_ID = "account_id";
const NEWS_ID = "news_id"
var simpleFilter = new Set()
async function reflashRecommendStatus(account_id, item_id) {
    var selectNewsItem = "select * from toutiao_news where item_id=%s"
    var selectLabelSql = "select label from toutiao_news_labels where id=%s"
    selectNewsItem = util.format(selectNewsItem, item_id)
    selectLabelSql = util.format(selectLabelSql, item_id)
    console.log(selectNewsItem + "\n" + selectLabelSql)
    var newsItem = await DatabaseUtil.findNewsData(selectNewsItem)
    var labelList = await DatabaseUtil.findNewsData(selectLabelSql)
    if (newsItem && newsItem[0]) {
        var tmp = newsItem[0]
        // console.log(labelList)
        var labelArray = []
        labelList.forEach((c1) => {
            labelArray.push(c1["label"])
        })
        tmp[ComonHelpUtil.MySqlNewsDataBaseFields.labels] = labelArray
        tmp[ComonHelpUtil.MySqlNewsDataBaseFields.user_id] = account_id
        needToUpdateData.push(tmp)
    }
    console.log(needToUpdateData)
}

function reflashToMongoDb() {
    if (needToUpdateData && needToUpdateData.length != 0) {
        console.log("开始收集更新推荐 ...")
        console.log(needToUpdateData)
        DatabaseUtil.updateRecomendStatis(needToUpdateData)
        needToUpdateData = []
    }
}
setInterval(reflashToMongoDb, REFLASH_GAP)

async function postUsageStatus(ctx, next) {
    var querys = ctx.query
    var status = {}
    if (querys && querys[ACCOUNT_ID] && querys[NEWS_ID]) {
        var test = querys[ACCOUNT_ID] + "," + querys[NEWS_ID]
        if (!simpleFilter.has(test)) {
            simpleFilter.add(test)
            reflashRecommendStatus(querys[ACCOUNT_ID], querys[NEWS_ID])
            status["status"] = "success"
        } else {
            status["status"] = "has repeat news report"
        }
    } else {
        status["status"] = "para wrong"
    }
    ctx.type = "application/json"
    ctx.body = status
    await next()
}
module.exports = {
    "get /news/recommend_status": postUsageStatus
}
