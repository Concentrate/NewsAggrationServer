/**
 * Created by liudeyu on 2018/4/10.
 */

const contentArray=["纽约街头的惊人巧合","你所知道的全职写小说的压力有多大？","亚洲最有竞争力的地方，就是新加坡！","AI时代的IBM中国研究院：我们不一样 (下) | IBM超in播2018第6期",
,"荣耀v10和华为p10相比哪个更值得入手","姚麦20年之间的那些事：麦迪为姚出头干架，姚麦如今回到当初","绝杀开拓者后！保罗说出生涯最心酸的话：第1次有需要包夹的队友",
"昨天腾讯损失了1100亿，为什么说和小学生有关，是小学生造成的？","李明博被检方起诉 成第4位因涉腐站上法庭的韩国总统"]
const nodejieba = require("nodejieba");

for(let t of contentArray){
    console.log(t)
    const result = nodejieba.extract(t, 3);
    console.log(result);
}

