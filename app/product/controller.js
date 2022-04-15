// import model
const Model = require('./model');
const Category = require('../category/model');
const Tag = require('../tag/model');
const config = require('../config');

// Package Upload File
const fs = require('fs');
const path = require('path');

// Hak Akses
const { policyFor } = require('../policy');

async function index(req, res, next) {
    try {
        let { limit = 10, skip = 0, q = '', category = '', tags = [] } = req.query;
        let criteria = {};
        if(q.length){
             // --- gabungkan dengan criteria --- //
            criteria = {...criteria, name: {$regex: `${q}`, $options: 'i'}}
        }
        if(category.length){
            category = await Category.findOne({name: {$regex: `${category}`}, $options: 'i'});
            if(category) {
                criteria = {...criteria, category: category._id}
            }
        }
        if(tags.length){
            tags = await Tag.find({name: {$in: tags}});
            criteria = {...criteria, tags: {$in: tags.map(tag => tag._id)}}
        }
        let count = await Model.find(criteria).countDocuments();      
        let products = await Model.find(criteria)
            .populate('category')
            .populate('tags')
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .select('-__v');
        return res.json({data: products, count});
    } catch (error) {
        next(error);
    }
}

async function store(req, res, next) {

    try {
        let policy = policyFor(req.user);

        if(!policy.can('create', 'Product')){
            return res.json({
                error: 1, 
                message: `Anda tidak memiliki akses untuk membuat produk`
            });
        }
        let payload = req.body;

        if(payload.category){
            let category = await Category.findOne({name: {$regex: payload.category, $options: 'i' }});
            if(category) {
                payload = {...payload, category: category._id}; 
            } else {
                delete payload.category; 
            }
        }
        if(payload.tags && payload.tags.length){
            let tags = await Tag.find({name: {$in: payload.tags}});
            if(tags.length){
                // jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
                payload = {...payload, tags: tags.map( tag => tag._id)}
            }
        }        
        if (req.file) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`);
            // baca file yang masih di lokasi sementara 
            const src = fs.createReadStream(tmp_path);
            // pindahkan file ke lokasi permanen
            const dest = fs.createWriteStream(target_path);
            // mulai pindahkan file dari `src` ke `dest`
            src.pipe(dest);
            src.on('end', async () => {
                try {
                    let product = new Model({...payload, image_url: filename});
                    await product.save();
                    return res.json(product);
                } catch (error) {
                    // jika error, hapus file yang sudah terupload pada direktori
                    fs.unlinkSync(target_path);
                    // cek apakah error disebabkan validasi MongoDB
                    if(error && error.name === 'ValidationError'){
                        return res.json({
                            error: 1, 
                            message: error.message, 
                            fields: error.errors
                        })
                    }
                    // berikan ke express error lainnya
                    next(error);
                }
            });
            src.on('error', async() => {
                next(error);
            });
        } else {
            let product = new Model(payload);
            await product.save();
            return res.json(product);
        }
    } catch (error) {
        if(error && error.name === 'ValidationError'){
            return res.json({
                error: 1, 
                message: error.message, 
                fields: error.errors
            });
        }
        next(error);
    }
}

async function update(req, res, next) {
    try {
        //--- cek policy ---/
        let policy = policyFor(req.user);
        if(!policy.can('update', 'Product')){ 
            return res.json({
                error: 1, 
                message: `Anda tidak memiliki akses untuk mengupdate produk`
            });
        }
        let payload = req.body;
        if(payload.category){
            let category = await Category.findOne({name: {$regex: payload.category, $options: 'i'}});
            if(category){ 
                payload = {...payload, category: category._id};
            } else {
                delete payload.category;
            }
        }
        if(payload.tags && payload.tags.length){
            let tags = await Tag.find({name: {$in: payload.tags}});
            if(tags.length){
                // jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
                payload = {...payload, tags: tags.map( tag => tag._id)}
            }
        }
        if (req.file) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`);
            // baca file yang masih di lokasi sementara 
            const src = fs.createReadStream(tmp_path);
            // pindahkan file ke lokasi permanen
            const dest = fs.createWriteStream(target_path);
            // mulai pindahkan file dari `src` ke `dest`
            src.pipe(dest);
            src.on('end', async () => {
                try {
                    // Find Produk yang akan di update
                    let product = await Model.findOne({_id: req.params.id});
                    // dapatkan path lengkap ke tempat penyimpanan image berdasarkan `product.image_url`
                    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
                    // cek apakah `file` benar-benar ada di file system
                    if(fs.existsSync(currentImage)){
                        // hapus jika ada.
                        fs.unlinkSync(currentImage);
                    }
                    // Update
                    product = await Model.findOneAndUpdate({_id: req.params.id}, {...payload, image_url: filename}, {new: true, runValidators: true});
                    return res.json(product);
                } catch (error) {
                    // jika error, hapus file yang sudah terupload pada direktori
                    fs.unlinkSync(target_path);
                    // cek apakah error disebabkan validasi MongoDB
                    if(error && error.name === 'ValidationError'){
                        return res.json({
                            error: 1, 
                            message: error.message, 
                            fields: error.errors
                        })
                    }
                    // berikan ke express error lainnya
                    next(error);
                }
            });
            src.on('error', async() => {
                next(error);
            });
        } else {
            // let product = new Model(payload);
            let product = await Model.findOneAndUpdate({_id: req.params.id}, payload, {new: true, runValidators: true});
            return res.json(product);
        }
    } catch (error) {
        if(error && error.name === 'ValidationError'){
            return res.json({
                error: 1, 
                message: error.message, 
                fields: error.errors
            });
        }
        next(error);
    }
}

async function destroy(req, res, next){
    try {
        //--- cek policy ---/
        let policy = policyFor(req.user);
        if(!policy.can('delete', 'Product')){ 
            return res.json({
                error: 1, 
                message: `Anda tidak memiliki akses untuk menghapus produk`
            });
        }
        let product = await Model.findOneAndDelete({_id: req.params.id});
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
        if(fs.existsSync(currentImage)){
            fs.unlinkSync(currentImage)
        }
        return res.json(product);
    } catch(error) {
        next(error);
    }
}

module.exports = { index, store, update, destroy }