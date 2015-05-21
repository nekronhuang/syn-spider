var express = require('express'),
    cheerio = require('cheerio'),
    request = require('superagent'),
    async = require('async'),
    app = express();

var port = 5000;
var zhihu = require('../config').zhihu;

console.time('time');

async.waterfall([
    function(nextStep) {
        request
            .get('http://zhihu.com')
            .end(function(err, res) {
                var $ = cheerio.load(res.text, {
                    normalizeWhitespace: true,
                    decodeEntities: false
                });
                var xsrf = $('.view.view-signin').find('input[name="_xsrf"]').attr('value');
                nextStep(err, xsrf);
            });
    },
    function(xsrf, nextStep) {
        request
            .post('http://www.zhihu.com/login')
            .type('form')
            .send({
                _xsrf: xsrf,
                email: zhihu.user,
                password: zhihu.pwd,
                rememberme: 'y'
            })
            .set('X-Requested-With', 'XMLHttpRequest') //must be ajax
            .end(function(err, res) {
                nextStep(err, res.headers);
            });
    },
    function(headers, nextStep) {
        var cookies = [];
        // cookies.push(headers['set-cookie'][0].split(';')[0]);
        cookies.push(headers['set-cookie'][2].split(';')[0]);
        request
            .get('http://www.zhihu.com')
            .set('Cookie', cookies.join(';'))
            .end(function(err, res) {
                var $ = cheerio.load(res.text, {
                    normalizeWhitespace: true,
                    decodeEntities: false
                });
                console.log(res.req._headers);
                console.log($('.zu-top-nav-userinfo').html());
                nextStep(err);
            });
    }
], function(err) {
    if (err) throw err;
    console.timeEnd('time');
});

app.listen(port, function() {
    console.log('listening %s', port);
});
