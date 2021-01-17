exports.createResponse = function (statusCode, message) {
    return {
        statusCode: statusCode,
        body: JSON.stringify({
            message: message
        })
    };
}
  