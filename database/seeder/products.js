const Product = require('../../app/product/model');
const Category = require('../../app/category/model');
const Tag = require('../../app/tag/model');
const fs = require('fs');
const mongoose = require('mongoose');

async function destroyAndMigrate(req, res, next){
    try {
        await Product.deleteMany({});
        let json_file = fs.readFileSync('./database/json/products.json');
        let data = await JSON.parse(json_file);

        data.map( async (row) => {
            if(row.category){
                let category = await Category.findById(row.category.$oid);
                if(category) {
                    row = {...row, category: category._id}; 
                } else {
                    delete row.category; 
                }
            }
            if(row.tags && row.tags.length){
                const arrayId = [];
                row.tags.map((index) => {
                    arrayId.push(index.$oid)
                })
                let tags = await Tag.find({_id: {$in: arrayId}});
                if(tags.length){
                    row = {...row, tags: tags.map( tag => tag._id)}
                } else {
                    delete row.tags;
                }
            }

            delete row._id 
            delete row.createdAt
            delete row.updatedAt
            delete row.__v

            let product = await Product(row);
            product.save();
        })
        res.json(data); 
    } catch(error) {
        next(error);
    }
}

module.exports = { destroyAndMigrate }