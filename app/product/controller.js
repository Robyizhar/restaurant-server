// import model `Product`
const Model = require('./model');
const config = require('../config');

// Package Upload File
const fs = require('fs');
const path = require('path');

async function index(req, res, next) {
    try {
        let { limit = 5, skip = 0 } = req.query;
        let products = await Model.find().limit(parseInt(limit)).skip(parseInt(skip));
        return res.json(products);
    } catch (error) {
        next(error);
    }

}

async function store(req, res, next) {
    try {
        let payload = req.body;

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
        let payload = req.body;

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
            let product = new Model(payload);
            await product.findOneAndUpdate({_id: req.params.id}, payload, {new: true, runValidators: true});
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
        let product = await Model.findOneAndDelete({_id: req.params.id});
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

        if(fs.existsSync(currentImage)){
            fs.unlinkSync(currentImage)
        }

        return res.json(product);
    } catch(err) {
        next(err);
    }
}

module.exports = { index, store, update, destroy }