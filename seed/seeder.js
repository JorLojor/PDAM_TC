const exec_sync = require('child_process').execSync;
require('dotenv').config();

try {
    exec_sync(`mongorestore ${process.env.mongodb2} --drop ${process.cwd()}/seed/data/training_center`);    
    console.log('Restore training_center success')
} catch (error) {
    console.log('Restore training_center error')    
}