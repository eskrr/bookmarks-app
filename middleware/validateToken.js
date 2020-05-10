const {TOKEN} = require( './../config' );

function validateToken(req, res, next) {
    let token = req.headers.authorization || req.headers['book-api-key'] || req.query.apiKey;

    if(!token) {
        errMsg = 'Send auth token using authorization or book-api-key header, you can also use the apiKey query param.';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(401).end();
    }
    if(token !== `Bearer ${TOKEN}` && token !== TOKEN){
        errMsg = 'INVALID TOKEN';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(401).end();
    }

    next();
}

module.exports = validateToken;
