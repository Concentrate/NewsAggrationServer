/**
 * Created by liudeyu on 2018/4/8.
 */
function IsNum(s) {
    if (s != null && s != "") {
        return !isNaN(s);
    }
    return false;
}
//数据库字段
MongodbRecommendStatusFields={
    mongodb_name:"toutiao_news",
    recomend_collection:"recomend_collection",
    user_id:"user_id",
    labels:"labels",//新闻有时候有label
    tags:"tags",//比较笼统的tag
    news_ids:"news_ids",
    source:"source",//出版方
    title_keywords:"title_keywords",//每次点击新闻标题的keyword记录
    all_keyword_ranking:"all_keyword_ranking"//总的点击新闻的keyword按照频率加上分数排行
}
MySqlNewsDataBaseFields={
    user_id:"user_id",
    labels:"labels",
    item_id:"item_id",
    source:"source",
    tag:"tag",
    title:"title"
}

module.exports={
    isNum:IsNum,
    MongodbRecommendStatusFields:MongodbRecommendStatusFields,
    MySqlNewsDataBaseFields:MySqlNewsDataBaseFields
}