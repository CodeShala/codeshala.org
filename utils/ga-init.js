var ga = require('node-ga');
module.exports = function (app) {
    app.use(ga('UA-115351307-1', {
        safe: true
    }));
}
