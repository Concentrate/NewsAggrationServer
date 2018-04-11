/**
 * Created by liudeyu on 2017/11/20.
 */
'use strict'
var KOA = require("koa")
var Koa_parser = require("koa-bodyparser")
var ROUTER = require("koa-router")
const app = new KOA()
const router = new ROUTER()
app.use(router.routes())
router.get("/", async (ctx, next) => {
    var object={
        count:100,
        interval:1,
        methods:[]
    }
    var urls=["https://www.google.com.hk/?gws_rd=ssl"]
    for(let i in urls){
        var tmp={}
        tmp["url"]=urls[i]
        tmp["method"]="get"
        tmp["header"]={
            "cache-control":"no-cache"
        }
        tmp["body"]="stupid"
        tmp["addCommonParas"]=true
        object.methods.push(tmp)
    }
    ctx.response.body=JSON.stringify(object)
    ctx.response.type="application/json"
    console.log("request is "+ctx.request.url)
})
app.listen(3000)
console.log("server start")
