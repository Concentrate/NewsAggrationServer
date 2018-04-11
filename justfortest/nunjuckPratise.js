/**
 * Created by liudeyu on 2017/8/7.
 */
'use strict'
var nun=require("nunjucks")
const KOA=require("koa")
var koa=new KOA
var env=new nun.Environment(new nun.FileSystemLoader("test"),{
    autoescape:true,
    watch:true
})
var res=env.render("index.html",{name:"ok",value:"stupid boy,so we call you sb"})
console.log(res)