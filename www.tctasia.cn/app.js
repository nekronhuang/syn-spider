var async = require('async'),
    cheerio = require('cheerio'),
    nedb = require('nedb'),
    iconv = require('iconv-lite'),
    http = require('http');

var config = {
        db: 'local.db',
        url: 'http://www.tctasia.cn/guanzhongzhongxin/zhanshangliebiao.html',
        encoding: 'utf8'
    },
    db;

iconv.extendNodeEncodings();

console.time('Time');

async.waterfall([
    function (next) {
        db = new nedb(config.db);
        db.loadDatabase(next);
    },
    function (next) {
        http.get(config.url, function (res) {
            var chunks = [];
            res.on('data', function (chunk) {
                chunks.push(chunk);
            });
            res.on('end', function () {
                var data = Buffer.concat(chunks).toString(config.encoding);
                next(null, data);
            });
        });
    },
    function (data, next) {
        var $ = cheerio.load(data, {
            normalizeWhitespace: true,
            decodeEntities: false
        });
        $('.l').each(function (v, i) {
            var $this = $(this);
            if ($this.css('width') == '490px') {
                console.log($this.text());
            }
        });
        next();
    }
], function (err) {
    if (err) {
        console.error(err);
    }
    console.timeEnd('Time');
});