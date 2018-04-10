/**
 * Created by liudeyu on 2018/4/8.
 */
function IsNum(s) {
    if (s != null && s != "") {
        return !isNaN(s);
    }
    return false;
}


module.exports={
    isNum:IsNum
}