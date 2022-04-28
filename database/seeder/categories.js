const Category = require('../../app/category/model');
const fs = require('fs');
const mongoose = require('mongoose');

async function destroyAndMigrate(req, res, next){
    try {
        await Category.deleteMany({});
        let json_file = fs.readFileSync('./database/json/categories.json');
        let data = JSON.parse(json_file);

        data.map( async (row) => {

            // delete row._id  mongoose.Types.ObjectId();
            delete row.createdAt
            delete row.updatedAt
            delete row.__v

            row = {...row, _id: mongoose.Types.ObjectId(row._id.$oid)}; 
            // console.log(row);
            let category = await Category(row);
            category.save();
        })
        res.json(data); 
    } catch(error) {
        next(error);
    }
}

module.exports = { destroyAndMigrate }