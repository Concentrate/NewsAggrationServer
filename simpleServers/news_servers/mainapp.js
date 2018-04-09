/**
 * Created by liudeyu on 2018/4/2.
 */
'use strict'
const KOA=require("koa")
const KOA_ROUTER=require("koa-router")
const registControllers=require("../../Controller")
var app=new KOA();
var appRouter=new KOA_ROUTER();

app.use(async(ctx,next)=>{
    var before=Date.now();
    await next();
    var after=Date.now();
    console.log("一次连接处理时间为 "+(after-before)+"ms");
})
app.use(registControllers["router"]("./simpleServers/controllers"))
app.listen(2400)
console.log("listen at 2400")