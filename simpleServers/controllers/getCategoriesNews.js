/**
 * Created by liudeyu on 2018/4/8.
 */
'use strict'
const mysql = require("mysql")
const util = require("util")
const commonUtil = require("../util/CommonHelpUtils")
const DatabaseUtil = require("../util/DatabaseUtils")

const PAGE = "page";
const newsDataReflashCount = 300;
var categoryCacheData = {}
const reflash_gap = 3*60 * 1000;
const CATEGORY = "category"
var categoriesNews = ["news", "news_tech", "news_society", "news_entertainment", "news_story", "news_essay", "news_travel", "news_sports"
,"video_movie","video_music"]
function updateData() {
    var aSet=new Set(categoriesNews)
    for (let category of aSet) {
        const tmpStr = "select * from toutiao_news where tag='%s' order by behot_time desc limit %d;"
        var selectSql = util.format(tmpStr, category, newsDataReflashCount)
        DatabaseUtil.findNewsData(selectSql).then(function (data) {
            if(!data||data.length==0){
                categoriesNews.pop(category)
            }else{
                categoryCacheData[category] = data;
            }
            console.log(category + " is init and the length of it is " + data.length);

        }).catch(function (err) {
            categoriesNews.pop(category)
        })
    }
}

setInterval(updateData, reflash_gap)
// updateData()
async function getCategoryNewsData(ctx, next) {
    ctx.type = "application/json"
    var response = {}
    var querys = ctx.query
    var cate = querys[CATEGORY]
    if (querys && cate) {
        var tmp = querys[PAGE]
        var page = 0
        if (commonUtil.isNum(tmp)) {
            page = parseInt(tmp)
        }
        var data;
        data = categoryCacheData[cate]
        response["status"] = "ok"
        if (data && (page + 1) * 10 < data.length) {
            response["data"] = data.slice(page * 10, (page + 1) * 10)
        } else {
            response["data"] = {}
        }
        if (categoriesNews.indexOf(cate) == -1) {
            categoriesNews.push(cate)
        }
    } else {
        response["status"] = "error"
        response["reason"] = "wrong category parameter"
        response["data"] = []
    }
    ctx.body = response
    await next()
}

module.exports = {
    "get /feed/category_news": getCategoryNewsData
}