const getHealthStatus =() =>{
    return {
        status: "OK",
        message :" Workhub  API is running",
    };
};

module.exports = {
    getHealthStatus
}