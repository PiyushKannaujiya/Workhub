const {getHealthStatus} = require("../services/healthService");
const healthCheck = (req, res) =>{
    const healthstatus = getHealthStatus();
    res.json(healthstatus);
};

module.exports ={
    healthCheck,
};