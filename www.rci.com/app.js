var express = require('express'),
    cheerio = require('cheerio'),
    request = require('superagent'),
    async = require('async'),
    nedb = require('nedb'),
    app = express();

var db;
var begin = 0;
var end = 2750;
var port = 5000;

console.time('time');

function detail() {
    request
        .post('http://www.rci.com/resort-directory/resortDetails')
        .send({
            resortCode: 'BBV3',
            whichTab: 'availUnits', //availUnits,resortDtls
            fromPage: 'resortDirResults',
            sortBy: 'P_ResortName:1'
        })
        .set('cookie', 'USER_AUDIENCE=rci; USER_TYPE=VISITOR; USER_COUNTRY=US; TLTSID=5C2398A105E64FF4E4562FA95527AECD; TLTUID=20A6B04308626F7C6764A34AC8CE3D2F; USER_USERNAME=; s_cc=true; __unam=6a08a7a-14d4c198f9f-19224e2a-12; s_vi=[CS]v1|2AA97BF2851D62B6-4000190D200130FC[CE]; s_fid=6F79F28A06A5B47F-258110FC55DB81EF; s_transType=Searchers; s_sq=rciprod%3D%2526pid%253DRCI%25253Azh_CN%25253AVIS%25253AUS%25253ARD%25253A%252520%25253AAvail%252520Units%2526pidt%253D1%2526oid%253Dhttp%25253A%25252F%25252Fwww.rci.com%25252Fpre-rci-en_US%25252Findex.page%25253Fclocale%25253Den_US%2526ot%253DA; C_LOCALE=en_US; USER_LOCALE=en_US; JSESSIONID=P6QTm0YQBIf5Ox0ubdymAXQqnCiPQ0beNFeat9W3M3dPCNG2XL5U!2124931482')
        .type('application/x-www-form-urlencoded')
        .end(function (err, res) {
            var $ = cheerio.load(res.text, {
                normalizeWhitespace: true,
                decodeEntities: false
            });
            console.log($('#resortDtls .module-item').html());
        });
}

async.whilst(
    function () {
        return begin < end;
    },
    function (callback) {
        async.waterfall([
            function (next) {
                setTimeout(next, Math.random() * 2000);
            },
            function (next) {
                db = new nedb('local.db');
                db.loadDatabase(next);
            },
            function (next) {
                var url = 'http://www.rci.com/resort-directory/list-view?searchKey=Nao=' + begin + '%26Ne=2876456471%2B2876456762%2B2876458925%2B34%2B%26N=2876456233%2B2876456470&sortKey=P_ResortName:1&isRemoving=undefined&ajax=true&resortFilter=&recCount=25';
                next(null, url);
            },
            function (url, next) {
                request
                    .get(url)
                    .end(function (err, res) {
                        console.log('%s is %d', url, res.status);
                        next(err, res.text);
                    });
            },
            function (chunks, next) {
                var $ = cheerio.load(chunks, {
                    normalizeWhitespace: true,
                    decodeEntities: false
                });
                var insert = [];
                $('#srchResultList1 .carrot-link').each(function (v, i) {
                    insert.push({
                        attr: $(this).attr('onclick')
                    });
                });
                db.insert(insert, next);
            }
        ], function (err) {
            begin += 25;
            callback(err);
        });
    },
    function (err) {
        if (err) throw err;
        console.timeEnd('time');
    }
);

app.listen(port, function () {
    console.log('listening %s', port);
});
