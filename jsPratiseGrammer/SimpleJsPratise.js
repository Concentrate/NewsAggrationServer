/**
 * Created by liudeyu on 2017/8/4.
 */
'use strict'
var commonUtil = require("../Util/CommonUtil")
var fs = require("fs")

// fs.readFile("./app.js",function (err,data) {
//     if(err){
//         console.log(err)
//     }else{
//         console.log(data.toString())
//     }
//
// })
// new Promise((success,err)=>{
//     try{
//         var data=fs.readFileSync("./apple.js","utf8")
//         success(data)
//     }catch(aErr){
//         err(aErr)
//     }
// }).then(function (data) {
//     console.log(data)
// }).catch(function (err) {
//     console.log(err.message)
// })
const fn = function () {
    return new Promise(function (success, fail) {
        setTimeout(() => {
            fail("wrong")
        }, 2000);
    })
}
async function syncTest() {
    var t
    try {
        t = await fn()
    } catch (err) {
        t = err
    }
    console.log(t)

}
async function F1() {
    const t = await new Promise(function (receive,reject) {
        setTimeout(()=>{
            receive(123,)
        },1000)
    })
    return t
}
F1().then((msg) => console.log(msg))
console.log(F1())