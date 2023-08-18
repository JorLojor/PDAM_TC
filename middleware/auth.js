const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = {
    user: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const secret_key = process.env.secret_key;
    
        try {
            const token = authHeader.split(' ')[1];
    
            jwt.verify(token, secret_key, (err, user) => {
    
                if (err) return res.sendStatus(403);
                req.user = user;
    
                if (req.user.role !== 1 && req.user.role !== 2 && req.user.role !== 3) return res.json('you dont have permission').status(403);
                next();
            });
        } catch (error) {
            res.sendStatus(401);
        }
    },
    student: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const secret_key = process.env.secret_key
        
        try{
            const token = authHeader.split(' ')[1];

            jwt.verify(token, secret_key, (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user
                if (req.user.role !== 3 && req.user.role !== 1) return res.json('you dont have permission').status(403);
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
                if (req.user.role !== 2 && req.user.role !== 1) return res.json('you dont have permission').status(403);
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
    server:async(req,res,next)=>{
        const authHeader = req.headers.authorization;
        
        try{
            const token = authHeader.split(' ')[1];
            console.log(authHeader);

            if (!token || token === undefined) {
                res.status(401).send('Not Authorize')
                return;
            }

            if (token !== process.env.key_for_grant_access) {
                res.status(403).send('Forbidden')
                return;
            }
            
            next();
        }catch(error){
            res.sendStatus(401);
        }
    }
}
