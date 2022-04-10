// import model `tag`
const Model = require('./model');
const config = require('../config');

// Package Upload File
const fs = require('fs');
const path = require('path');

async function index(req, res, next) {
    try {
        let { limit = 5, skip = 0 } = req.query;
        let tag = await Model.find().limit(parseInt(limit)).skip(parseInt(skip));
        return res.json(tag);
    } catch (error) {
        next(error);
    }

}

async function store(req, res, next) {
    try {
        let payload = req.body;
        let tag = new Model(payload);
        await tag.save(); 
        return res.json(tag);

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
        let tag = await Model.findOneAndUpdate({_id: req.params.id}, payload, {new: true, runValidators: true});
        return res.json(tag);
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
        let tag = await Model.findOneAndDelete({_id: req.params.id});
        return res.json(tag);
    } catch(err) {
        next(err);
    }
}

module.exports = { index, store, update, destroy }