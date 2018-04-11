/**
 * Created by liudeyu on 2017/8/11.
 */
'use strict'
const Sequelize = require("sequelize")
const database = new Sequelize("test", "ldy", "abcd1234", {
    dialect: "mysql"
})
const Student = database.define("student", {
    id: {type: Sequelize.STRING, primaryKey: true},
    name: Sequelize.STRING,
    sex: Sequelize.DataTypes.STRING
},{
    timestamps:false,
    freezeTableName:true
})

Student.create(
    {
        id: "123",
        name: "xiaobing",
        sex: "girl"
    }
).then(function () {
    console.log("Ok")
})