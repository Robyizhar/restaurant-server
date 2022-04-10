// import model `category`
const Model = require('./model');
const config = require('../config');

// Package Upload File
const fs = require('fs');
const path = require('path');

async function index(req, res, next) {
    try {
        let { limit = 5, skip = 0 } = req.query;
        let category = await Model.find().limit(parseInt(limit)).skip(parseInt(skip));
        return res.json(category);
    } catch (error) {
        next(error);
    }

}

async function store(req, res, next) {
    try {
        let payload = req.body;
        let category = new Model(payload);
        await category.save(); 
        return res.json(category);

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
        let category = await Model.findOneAndUpdate({_id: req.params.id}, payload, {new: true, runValidators: true});
        return res.json(category);
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
        let category = await Model.findOneAndDelete({_id: req.params.id});
        return res.json(category);
    } catch(err) {
        next(err);
    }
}

module.exports = { index, store, update, destroy }