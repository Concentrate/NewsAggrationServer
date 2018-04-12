/**
 * Created by liudeyu on 2018/4/11.
 */
'use strict'
const DatabaseUtil = require("./DatabaseUtils")
const CommenHelpUtil = require("./CommonHelpUtils")
const util = require("util")
var cacheRecommendData = {}
const EVERY_RECOMMEND_NUM = 15;
const labels = CommenHelpUtil.MongodbRecommendStatusFields.labels
const ranking_keywords = CommenHelpUtil.MongodbRecommendStatusFields.all_keyword_ranking
const tags = CommenHelpUtil.MongodbRecommendStatusFields.tags
const RE_FLASH_RECOMMEND_DATA_GAP = 5 * 60 * 1000; //推荐数据刷新间隔 ms 2min
const EXPIRED_RECOMMEND_TIME = 30 * 60 * 1000; //无请求清除过期缓存时间 30min
function getRecommondData(id_info) {
    var user_id = id_info["user_id"]
    var timestamp = id_info["timestamp"]
    if (!cacheRecommendData[user_id]) {
        updateRecommondData(user_id, timestamp)
        return []
    } else if (cacheRecommendData[user_id]) {
        var res = cacheRecommendData[user_id]["data"].splice(EVERY_RECOMMEND_NUM)
        cacheRecommendData["timestamp"] = timestamp;
        if (!res) {
            updateRecommondData(user_id, timestamp).then(function (res) {

            })
        } else {
            return res;
        }
    }
}

function getMostCountKeys(array) {
    array.sort(function (a, b) {
        return b["count"] - a["count"]
    })
    return array.slice(0, 3)
}


async function getNewsWithFalaor(labelList, selectSql, everylimitCount, allResult) {
    for (let a1 of labelList) {
        var tmpsql = util.format(selectSql, a1["name"], everylimitCount)
        console.log(tmpsql)
        var bResult = await DatabaseUtil.findNewsData(tmpsql)
        for (let b1 of bResult) {
            allResult.push(b1)
        }
    }
}


async function getRecommendAlgrithmnData(userInfo) {
    var aLabelList = userInfo[labels]
    var mostPopLabels = getMostCountKeys(aLabelList).slice(0, 3)
    var aKeywords = userInfo[ranking_keywords]
    var mostPopKeyWord = getMostCountKeys(aKeywords).slice(0, 3)
    var aTagList = userInfo[tags]
    var mostPopTags = getMostCountKeys(aTagList).slice(0, 3)
    var allResult = []
    const limitNum = 10;
    var selectNews = "select * from toutiao_news_labels as a join toutiao_news as b where a.id=b.item_id and  a.label=\"%s\"" +
        " order by b.behot_time desc limit %d;"
    await getNewsWithFalaor(mostPopLabels, selectNews, limitNum * 5, allResult)
    seleNewsSql = "select * from toutiao_news where tag=\"%s\" order by behot_time desc limit %d"
    await getNewsWithFalaor(mostPopTags, seleNewsSql, limitNum * 4, allResult)
    var seleNewsSql = "select * from toutiao_news where title regexp '.*%s.*' order by behot_time desc limit %d"
    await getNewsWithFalaor(mostPopKeyWord, seleNewsSql, limitNum, allResult)
    console.log("查找推荐数据库长度为 %d", allResult.length)
    return allResult
}


function updateRecommondData(user_id, timestamp) {
    return new Promise(async function (resolve, reject) {
        const USER_ID = CommenHelpUtil.MongodbRecommendStatusFields.user_id
        //一个js很坑的地方 {key:value},直接把key用变量放进去是不行的，key还是识别到那个变量名而不是变量值，idea上面灰色也显示了这个意思
        var findObj = {}
        findObj[USER_ID] = user_id + ""
        var userInfoArray = await DatabaseUtil.mongoDbFindResult(findObj)
        var userInfo = userInfoArray[0]
        if (!userInfo || !userInfo[USER_ID]) {
            return
        }
        var tmpResult = await getRecommendAlgrithmnData(userInfo)
        cacheRecommendData[user_id] = {}
        if (timestamp) {
            cacheRecommendData[user_id]["timestamp"] = timestamp
        }
        cacheRecommendData[user_id]["data"] = tmpResult
        console.log("得到推荐数据,user_id 为 %s,推荐数据为 %d", user_id, tmpResult.length)

    })
}

function updateRecomendDataInterval() {
    for (let user_id in cacheRecommendData) {
        var date = new Date().getTime()
        if (date - cacheRecommendData[user_id]["timestamp"] > EXPIRED_RECOMMEND_TIME) {
            delete cacheRecommendData[user_id]
        } else {
            updateRecommondData(user_id)
        }
    }
}
setInterval(updateRecomendDataInterval, RE_FLASH_RECOMMEND_DATA_GAP)
module.exports = {
    getRecommondData: getRecommondData
}