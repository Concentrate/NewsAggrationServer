/**
 *
 * Created by liudeyu on 2017/8/4.
 */

'use strict'
var log=function () {
    for(var i=0;i<arguments.length;i++){
        console.log(arguments[i]+" ")
    }
}
module.exports={
    mlog:log

}
