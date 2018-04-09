/**
 * Created by liudeyu on 2017/8/5.
 */
'use strict'
var fs = require("fs")
var commonUtil = require("./Util/CommonUtil")
var router = new require("koa-router")()
var registHandlerPath = function (dir) {
    var dirName = dir || "Controller"
    const controllerDir = __dirname + "/" + dirName
    var allFile = fs.readdirSync(controllerDir)
    var jsFiles = allFile.filter(file => {
        return file.endsWith("js")
    })
    for (let index in jsFiles) {
        let file=jsFiles[index]
        console.log("file is " + file)
        const requirJS=controllerDir + "/" + file.substring(0, file.indexOf(".js"))
        commonUtil.mlog("require is "+requirJS)
        let aExport = require(requirJS)
        for (let key in aExport) {
            let path = key.substring(key.lastIndexOf(" ")+1)
            commonUtil.mlog("key is " + key + " and the path is " + path)
            if (key.toLowerCase().startsWith("get")) {
                router.get(path, aExport[key])
            } else if (key.toLowerCase().startsWith("post")) {
                router.post(path, aExport[key])
            } else {
                commonUtil.mlog("invaild url")
            }
        }

    }
    return router.routes()
}

module.exports = {
    router: registHandlerPath
}