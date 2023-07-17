const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = {
    user: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const secret_key = process.env.secret_key
        
        try{
            const token = authHeader.split(' ')[1];

            jwt.verify(token, secret_key, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user
                if (req.user.role === 2) return res.json('you dont have permission').status(403);
                next();
            });
        }catch(error){ 
            res.sendStatus(401);
        }
    },
    instruktur: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const secret_key = process.env.secret_key
        
        try{
            const token = authHeader.split(' ')[1];

            jwt.verify(token, secret_key, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user
                if (req.user.role === 3) return res.json('you dont have permission').status(403);
                next();
            });
        }catch(error){
            res.sendStatus(401);
        }
    },
    admin: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const secret_key = process.env.secret_key
        
        try{
            const token = authHeader.split(' ')[1];

            jwt.verify(token, secret_key, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user
                if (req.user.role !== 1) return res.json('you dont have permission').status(403);
                next();
            });
        }catch(error){
            res.sendStatus(401);
        }

    },
    adminAdnInstruktur: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const secret_key = process.env.secret_key
        
        try{
            const token = authHeader.split(' ')[1];

            jwt.verify(token, secret_key, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user
                if (req.user.role === 1 || req.user.role === 2) return res.json('you dont have permission').status(403);
                next();
            });
        }catch(error){
            res.sendStatus
        }   
    },
    userAndAdmin: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const secret_key = process.env.secret_key
        
        try{
            const token = authHeader.split(' ')[1];

            jwt.verify(token, secret_key, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user
                if (req.user.role === 3 || req.user.role === 2) return res.json('you dont have permission').status(403);
                next();
            });
        }catch(error){
            res.sendStatus(401);
        }
    }
}
