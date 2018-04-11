/**
 * Created by liudeyu on 2018/4/10.
 */
'use strict'

var mysql = require("mysql")
const util = require("util")
const CommonHelpUtil = require("./CommonHelpUtils")
var Mongodb = require("mongodb").MongoClient
const nodejieba = require("nodejieba")
const mongoUrl = "mongodb://localhost:27017/";
var connection = mysql.createConnection({
    user: "ldy",
    password: "abcd1234",
    database: "spider"
});
connection.connect();
function getImageUrlLists(item_id) {
    var selectSql = "select image_url from toutiao_imageurls where id=%d";
    selectSql = util.format(selectSql, item_id)
    return new Promise(function (res, rej) {
        connection.query(selectSql, function (err, result) {
            if (err) {
                console.log(err)
                rej(err)
                return
            }
            res(result)
        })
    })

}
function findNewsData(selectSql) {
    return new Promise(function (resolve, reject) {
        connection.query(selectSql, async function (err, result) {
            if (err) {
                console.log(err)
                reject(err)
                return;
            }
            async function getImageUrlsListInternal(item_id) {
                var image_wrapper = await getImageUrlLists(item_id)
                var image_urls = []
                for (let b1 of image_wrapper) {
                    try {
                        var b2 = b1["image_url"]
                        var b3 = b2.substring(b2.indexOf("//"), b2.indexOf("'}"))
                        image_urls.push("http:" + b3)
                    } catch (e) {
                    }
                }
                return image_urls
            }

            var tmpReflashData = []
            for (let tmp of result) {
                // var item_id = tmp["item_id"]
                // tmp["image_list"] = getImageUrlsListInternal(item_id)
                tmpReflashData.push(tmp)
            }
            resolve(tmpReflashData)
        })
    })
}
function getUpdateMongoData(tmpList) {
    var result = []
    while (tmpList.length != 0) {
        var newsItem = tmpList.pop()
        var tmp = {}
        tmp[CommonHelpUtil.MongodbRecommendStatusFields.user_id] = newsItem[CommonHelpUtil.MySqlNewsDataBaseFields.user_id]
        tmp[CommonHelpUtil.MongodbRecommendStatusFields.labels] = newsItem[CommonHelpUtil.MySqlNewsDataBaseFields.labels]
        tmp[CommonHelpUtil.MongodbRecommendStatusFields.tags] = newsItem[CommonHelpUtil.MySqlNewsDataBaseFields.tag]
        tmp[CommonHelpUtil.MongodbRecommendStatusFields.news_ids] = newsItem[CommonHelpUtil.MySqlNewsDataBaseFields.item_id]
        tmp[CommonHelpUtil.MongodbRecommendStatusFields.source] = newsItem[CommonHelpUtil.MySqlNewsDataBaseFields.source]
        // todo 这步耗时，看看关键词提取效果如何
        const title = newsItem[CommonHelpUtil.MySqlNewsDataBaseFields.title]
        var extraKeyWordsList = nodejieba.extract(title, 3)
        var title_key_words = []
        for (let tmpKeyWord of extraKeyWordsList) {
            let a1 = tmpKeyWord["word"]
            if (a1 && a1 !== "undefined") {
                title_key_words.push(a1)
            }
        }
        tmp[CommonHelpUtil.MongodbRecommendStatusFields.title_keywords] = title_key_words
        result.push(tmp)
        console.log("准备更新的数据")
        console.log(JSON.stringify(result,null,2))
    }
    return result

}

function mongoDbFindGetPromise(dbase, findObj) {
    return new Promise(function (resolve, rej) {
        dbase.collection(CommonHelpUtil.MongodbRecommendStatusFields.recomend_collection).find(findObj).toArray(function (err, result) {
            if (err) {
                console.log(err)
                rej(err)
                return
            }
            resolve(result)
        })
    })
}
function mongoDbInsertItem(dbco, insertObj) {
    return new Promise((resolve, reject) => {
        dbco.collection(CommonHelpUtil.MongodbRecommendStatusFields.recomend_collection).insertOne(insertObj, function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            resolve(reject)
            console.log(JSON.stringify(result, null, 2))
            console.log("插入成功")
        })
    })

}

function mongoDbUpdateItem(dbco, whereObj, updateObj) {
    return new Promise((resolve, reject) => {
        dbco.collection(CommonHelpUtil.MongodbRecommendStatusFields.recomend_collection).updateOne(whereObj, updateObj, function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            resolve(JSON.stringify(result, null, 2))
            console.log("更新成功")

        })
    })
}
/*更新统计数据*/
function updateRecomendStatis(newsItemList) {
    Mongodb.connect(mongoUrl, async function (err, db) {
        if (err) {
            console.log(e)
            return
        }
        const labels = CommonHelpUtil.MongodbRecommendStatusFields.labels
        const tags = CommonHelpUtil.MongodbRecommendStatusFields.tags
        const news_ids = CommonHelpUtil.MongodbRecommendStatusFields.news_ids
        const source = CommonHelpUtil.MongodbRecommendStatusFields.source
        const keywords_title = CommonHelpUtil.MongodbRecommendStatusFields.title_keywords
        const all_keyword_ranking = CommonHelpUtil.MongodbRecommendStatusFields.all_keyword_ranking
        const user_id = CommonHelpUtil.MongodbRecommendStatusFields.user_id;

        function createNewInsertItem(news_item) {
            var recomendItem = {}
            recomendItem[user_id] = news_item[user_id]
            recomendItem[labels] = {}
            for (let label of news_item[labels]) {
                recomendItem[labels][label] = 1;//每个label 次数刚开始为1

            }
            recomendItem[tags] = {}
            recomendItem[tags][news_item[tags]] = 1
            recomendItem[news_ids] = []
            recomendItem[news_ids].push(news_item[news_ids])
            recomendItem[source] = {}
            recomendItem[source][news_item[source]] = 1
            recomendItem[keywords_title] = {}
            var str1 = JSON.stringify(news_item[keywords_title].sort())
            recomendItem[keywords_title][str1] = 1
            recomendItem[all_keyword_ranking] = {}
            const ranking_title_keywords = news_item[keywords_title]
            for (let keyword of ranking_title_keywords) {
                recomendItem[all_keyword_ranking][keyword] = 1;
            }

            console.log(recomendItem)
            return recomendItem
        }

        function updateExistItemStatus(beforeItem, news_items) {

            function ifExistAddOneOrSetOne(key, value) {
                if (beforeItem[key][value]) {
                    var num = beforeItem[key][value]
                    num = parseInt(num)
                    beforeItem[key][value] = ++num;
                } else {
                    beforeItem[key][value] = 1
                }
            }

            for (let label of news_items[labels]) {
                ifExistAddOneOrSetOne(labels, label)
            }

            var aTag = news_items[tags]
            ifExistAddOneOrSetOne(tags, aTag)
            var aid = news_items[news_ids]
            beforeItem[news_ids].push(aid)
            var aSource = news_items[source]
            ifExistAddOneOrSetOne(source, aSource)
            var aKeyword_title = news_items[keywords_title]
            if (aKeyword_title) {
                var str1 = JSON.stringify(aKeyword_title.sort())
                ifExistAddOneOrSetOne(keywords_title, str1)
            }
            for (let keyword of aKeyword_title) {
                ifExistAddOneOrSetOne(all_keyword_ranking, keyword)
            }
            console.log("更新后的数据为\n %s", JSON.stringify(beforeItem))
        }

        var dbase = db.db(CommonHelpUtil.MongodbRecommendStatusFields.mongodb_name)
        var needToUpadteList = getUpdateMongoData(newsItemList)
        for (let item of needToUpadteList) {
            var findObj = {}
            findObj[user_id] = item[user_id]
            var result = await mongoDbFindGetPromise(dbase, findObj)
            if (!result || result.length == 0) {
                var insertObj = createNewInsertItem(item)
                await  mongoDbInsertItem(dbase, insertObj)
            } else {
                var existOne = result[0]
                updateExistItemStatus(existOne, item)
                var updateObj = {$set: existOne}
                await   mongoDbUpdateItem(dbase, findObj, updateObj)
            }
        }

        console.log("db close")
        db.close()
    })
}

module.exports = {
    "findNewsData": findNewsData,
    "updateRecomendStatis": updateRecomendStatis
}