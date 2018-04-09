/**
 * Created by liudeyu on 2017/8/7.
 */
'use strict'
var nun = require("nunjucks")
const path=require("path")
function createEnv(dir, opts) {
    var env = new nun.Environment(new nun.FileSystemLoader(dir),opts)
    return env
}

function templateing(dir, opts) {
    console.log("dir is " + dir)
    var myEnv = createEnv(dir, opts)
    return async (ctx, next) => {
        ctx.render = function (view, model) {
            ctx.response.body = myEnv.render(view, Object.assign({}, ctx.status || {}, model || {}))
            ctx.response.type = "text/html"
        }
        await next()
    }
}

module.exports = templateing