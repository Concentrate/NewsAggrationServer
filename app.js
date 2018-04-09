/**
 * Created by liudeyu on 2017/8/4.
 */
'use strict'
const isProduction = process.env.NODE_ENV === "production"
const Koa = require('koa');
// 创建一个Koa对象表示web app本身:
const app = new Koa();
const bodyParser = require("koa-bodyparser")
const controller = require("./Controller")
const staticDirUrlController = require("./static/DealWithStatic")
const template = require("./templating")
app.use(async (ctx, next) => {
    console.log(ctx.method + "   " + ctx.request.path)
    var start = new Date().getTime()
    await next()
    var endTime = new Date().getTime()
    ctx.response.set("X-Response-Time", `${endTime}-${start}ms`)

})
app.use(template("View", {
    noCache: !isProduction,
    watch: !isProduction
}))
if (!isProduction) {
    app.use(staticDirUrlController("/static/", __dirname + "/static/"))
}
app.use(bodyParser())
app.use(controller["router"]())
app.listen(8888)
