/**
 * Created by liudeyu on 2017/8/6.
 */
'use strict'
const path=require("path")
const mime=require("mime")
const fs=require("mz/fs")
function dealWithStaticUrl(url,dir) {
    return async (ctx,next)=>{
        let aPath=ctx.request.path
        if(aPath.startsWith(url)){
            let fileName=aPath.substring(aPath.indexOf(url)+1)
            fileName=path.join(dir,fileName)
            if(await fs.exists(fileName)){
                ctx.response.type=mime.lookup(fileName)
                ctx.response.body=await fs.readFile(fileName)
            }else{
                ctx.response.statusCode=404
            }
        }else{
            await next()
        }
    }
}
module.exports=dealWithStaticUrl