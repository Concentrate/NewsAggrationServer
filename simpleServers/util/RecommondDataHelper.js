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
function getRecommondData(id_info) {
    var user_id = id_info["user_id"]
    var timestamp = id_info["time_stamp"]
    if (!cacheRecommendData[user_id]) {
        updateRecommondData().then(function (res) {
        })
        return []
    } else if (cacheRecommendData[user_id]) {
        var res = cacheRecommendData[user_id]["data"].splice(EVERY_RECOMMEND_NUM)
        cacheRecommendData["timestamp"] = timestamp;
        if (!res) {
            updateRecommondData().then(function (res) {

            })
        } else {
            return res;
        }
    }
}

function getMostCountKeys(aDict) {
    var sdic = Object.keys(aDict).sort(function (a, b) {
        return dic[b] - dic[a]
    });
    console.log(sdic)
    return sdic
}


async function getNewsWithFalaor(labelList, sqlField, everylimitCount) {
    var selectSql = "select * from toutiao_news where %s like '\%%s\%' order by behot_time desc limit %d"
    var tmpArray = []
    for (let a1 of labelList) {
        selectSql = util.format(selectSql, sqlField, a1, everylimitCount)
        console.log(selectSql)
        var bResult = await DatabaseUtil.findNewsData(selectSql)
        for (let b1 of bResult) {
            tmpArray.push(b1)
        }
    }
    return tmpArray

}

function getRecommendAlgrithmnData(userInfo) {
    var aLabelList = userInfo[labels]
    var mostPopLabels = getMostCountKeys(aLabelList).slice(0, 3)
    var aKeywords = userInfo[ranking_keywords]
    var mostPopKeyWord = getMostCountKeys(aKeywords).slice(0, 3)
    var aTagList = userInfo[tags]
    var mostPopTags = getMostCountKeys(aTagList).slice(0, 3)
    var allResult = []
    const limitNum=30;
    allResult.push(getNewsWithFalaor(mostPopKeyWord,"title",limitNum))
    allResult.push(getNewsWithFalaor(mostPopTags,"tag",limitNum))
   // todo lable data待加入
    return allResult
}


function updateRecommondData(time_stamp, user_id) {
    return new Promise(function (resolve, reject) {
        const userId = CommenHelpUtil.MongodbRecommendStatusFields.user_id
        var userInfo = DatabaseUtil.mongoDbFindPromise({userId: user_id})
        var tmpResult = getRecommendAlgrithmnData(userInfo)
        cacheRecommendData[user_id] = {}
        cacheRecommendData[user_id]["timestamp"] = time_stamp
        cacheRecommendData[user_id]["data"] = tmpResult

    })
}

//todo 加上自动清除长时间无请求user_id cache data,和轮询更新recommend data