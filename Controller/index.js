/**
 * Created by liudeyu on 2017/8/5.
 */
"use strict";
var fnIndex = async (ctx, next) => {
    ctx.response.body = `
    <h1>Index</h1>
    <form action="/login" method="post">
    <p>Name: <input name="name" type="text"/> </p>
    <p>Password: <input name="password" type="password"></p>
    <p><input type="submit" value="commit"></p>
</form> `
    await next()
}

var dealIndex = async (ctx, next) => {
    ctx.render("index.html", {
        value: "welcome"
    })

}

module.exports = {
    "GET /": dealIndex
}