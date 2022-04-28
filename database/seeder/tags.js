const Tag = require('../../app/tag/model');
const fs = require('fs');
const mongoose = require('mongoose');

async function destroyAndMigrate(req, res, next){
    try {
        await Tag.deleteMany({});
        let json_file = fs.readFileSync('./database/json/tags.json');
        let data = JSON.parse(json_file);

        data.map( async (row) => {

            // delete row._id 
            delete row.createdAt
            delete row.updatedAt
            delete row.__v

            row = {...row, _id: mongoose.Types.ObjectId(row._id.$oid)};
            
            let tag = await Tag(row);
            tag.save();
        })
        res.json(data); 
    } catch(error) {
        next(error);
    }
}

module.exports = { destroyAndMigrate }