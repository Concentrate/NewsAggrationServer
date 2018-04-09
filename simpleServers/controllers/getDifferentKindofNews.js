/**
 * Created by liudeyu on 2018/4/8.
 */
'use strict'
const mysql = require("mysql")
const util = require("util")
const commonUtil = require("../util/commonHelpFun")


const connection = mysql.createConnection({
    user: "ldy",
    password: "abcd1234",
    database: "spider"
})
const PAGE = "page";
const AUTHEN = "authen";
const ACCOUNT_ID = "account_id";
const ReflashCount = 300;
var categoryCacheData = {}
const reflash_gap = 60 * 1000;
const CATEGORY = "category"
connection.connect()
var categorys = ["news", "news_tech", "news_society", "news_entertainment", "news_story"]
function updateData() {
    for (let category of categorys) {
        const tmpStr = "select * from toutiao_news where tag='%s' order by behot_time desc limit %d;"
        var selectSql = util.format(tmpStr, category, ReflashCount)
        console.log(selectSql)
        connection.query(selectSql, function (err, res) {
            if (err) {
                console.log(err)
                return;
            }
            categoryCacheData[category] = []
            for (let a1 of res) {
                categoryCacheData[category].push(a1)
            }
            console.log("%s is init ", category)
        })
    }
}

setInterval(updateData, reflash_gap)

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
        if (categorys.indexOf(cate) != -1) {
            data = categoryCacheData[cate]
        } else {
            data = categoryCacheData["news"]
        }
        response["status"] = "ok"
        if (data && (page + 1) * 10 < data.length) {
            response["data"] = data.slice(page * 10, (page + 1) * 10)
        } else {
            response["data"] = {}
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