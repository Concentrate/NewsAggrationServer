/**
 * Created by liudeyu on 2018/4/10.
 */

var mysql = require("mysql")
const util = require("util")
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

module.exports = {
    "findNewsData": findNewsData
}