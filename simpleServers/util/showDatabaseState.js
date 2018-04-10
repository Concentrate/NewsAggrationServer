/**
 * Created by liudeyu on 2018/3/25.
 */
'use strict'
const KOA = require("koa")
const mysql = require("mysql")
const KOA_ROUTER = require("koa-router")
const app = new KOA();
const router = new KOA_ROUTER();
var reNum = 0;
app.use(async (ctx, next) => {
    console.log("request time is " + new Date() + "and request header is " + JSON.stringify(ctx.request.header))
    reNum++;
    await next()
    console.log("request times is " + reNum)


})
router.get("/*", async (ctx, next) => {
    function getDatabaseInfo() {
        var connect = mysql.createConnection({
            user: "ldy",
            password: "abcd1234",
            database: "spider"
        })
        connect.connect()
        const exSql = `select count(*) from toutiao_news;`
        return new Promise(function (res, rej) {
            connect.query(exSql, function (err, result) {
                if (err) {
                    rej(err)
                    return;
                }
                console.log("reuslt is " + JSON.stringify(result))
                res(JSON.stringify(result))
            })

        })
    }

    ctx.body = await getDatabaseInfo()

})
app.use(router.routes())
const port = 8888
app.listen(port)
console.log("server is listenning " + port)