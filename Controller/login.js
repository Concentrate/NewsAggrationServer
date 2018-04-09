/**
 * Created by liudeyu on 2017/8/5.
 */
'use strict'
var fnLogin = async (ctx, next) => {
    const ACC_NAME = "name"
    const ACC__PASS = "password"
    var name = ctx.request.body.name;
    var password = ctx.request.body.password
    if (name === ACC_NAME && ACC__PASS === password) {
        console.log(`login name is ${name} and login password is ${password}`)
        ctx.response.body = `<p>ok</p>`
    } else {
        ctx.response.body = `<a href="/">try again</a>`
    }
}

var judgeLogin = async (ctx, next) => {
    var name = ctx.request.body.name || ""
    var password = ctx.request.body.password || ""
    if (name === "name" && password === "password") {
        ctx.render("sign_ok.html", {
            value: "sign ok"
        })
    } else {
        ctx.render("sign_fail.html", {
            value: "sign fialed"
        })
    }
}
module.exports = {
    "POST /login": judgeLogin
}