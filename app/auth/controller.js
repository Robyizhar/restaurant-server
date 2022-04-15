const Model = require('../user/model');

// Package untuk login user
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getToken } = require('../utils/get-token');


// Import Secret Key dari ENV File
const config = require('../config');

async function register(req, res, next){
    try{
        const payload = req.body; 
        let user = new Model(payload);
        await user.save(); 
        return res.json(user);
    } catch(error) {
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

async function localStrategy(email, password, done){
    try{
        let user = await Model
            .findOne({email})
            .select('-__v -createdAt -updatedAt -cart_items -token');

        // jika user tidak ditemukan, akhiri proses login
        if(!user) return done();

        // sampai sini artinya user ditemukan, cek password sesuai atau tidak
        if(bcrypt.compareSync(password, user.password)){
            ( {password, ...userWithoutPassword} = user.toJSON() );
            // akhiri pengecekkan, user berhasil login 
            // berikan data user tanpa password
            return done(null, userWithoutPassword);
        }
    } catch(error) {
        done(error, null) 
    }
    done();
}

async function login(req, res, next){
    passport.authenticate('local', async function(err, user){
        if(err) return next(err); 
        if(!user) return res.json({error: 1, message: 'email or password incorrect'})
        // buat JSON Web Token
        let signed = jwt.sign(user, config.secretKey); // <--- ganti secret key dengan keymu sendiri, bebas yang sulit ditebak
        // simpan token tersebut ke user terkait
        await Model.findOneAndUpdate({_id: user._id}, {$push: {token: signed}}, {new: true});
        // response ke _client_ 
        return res.json({
            message: 'logged in successfully', 
            user: user, 
            token: signed
        });
    })(req, res, next);
}

function me(req, res, next) {
    if(!req.user){
        return res.json({
            error: 1, 
            message: `Your're not login or token expired`
        });
    }
    return res.json(req.user);
}

async function logout(req, res, next){
    let token = getToken(req);
    // hapus `token` dari `User`
    let user = await User.findOneAndUpdate({token: {$in: [token]}}, {$pull: {token}}, {useFindAndModify: false});
    // --- cek user atau token ---//
    if(!user || !token){
        return res.json({
            error: 1, 
            message: 'No user found'
        });
    }

    return res.json({
        error: 0, 
        message: 'Logout berhasil'
    });

}


module.exports = { register, localStrategy, login, me, logout }