/**
 * Created by liudeyu on 2018/4/4.
 */
'use strict'
var mysql = require("mysql")
const util = require("util")
const CommonHelpFun = require("../util/commonHelpFun")
var allData = [];
const PAGE = "page";
const AUTHEN = "authen";
const ACCOUNT_ID = "account_id";
const reflash_page_count = 300;
var connection = mysql.createConnection({
    user: "ldy",
    password: "abcd1234",
    database: "spider"
});
connection.connect();

function updateData() {
    var selectSql = `select * from toutiao_news  order by behot_time desc limit %s;`;
    selectSql = util.format(selectSql, reflash_page_count + "")
    connection.query(selectSql, function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        allData = []
        for (let tmp of result) {
            allData.push(tmp)
        }
        console.log("all result length is " + allData.length)
    })

}
setInterval(updateData, 30 * 1000)

async function getRecomendData(ctx, next) {
    console.log("开始处理请求连接为 " + ctx.url)
    ctx.type = "application/json";
    var response = {};
    var querys = ctx.query;
    var page = 0;
    if (querys) {
        var tmp = querys[PAGE]
        if (CommonHelpFun.isNum(tmp)) {
            page = parseInt(tmp)
        }
    }
    response["status"] = "ok"
    if (allData && (page + 1) * 10 < reflash_page_count) {
        response["data"] = allData.slice(page * 10, (page + 1) * 10);
    } else {
        response["data"] = []
    }
    ctx.body = response
    await next()
}
module.exports = {
    "get /feed/all_news": getRecomendData
}