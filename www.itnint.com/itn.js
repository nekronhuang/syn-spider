var http = require('http'),
    cheerio = require('cheerio'),
    app = require('express')(),
    fs = require('fs');

var itn = 'http://www.itnint.com';

var urls = [],
    css = [],
    js = [];

function get(url) {
    var chunks = [];
    if (urls.indexOf(itn + url) < 0) {
        console.log(url);
        http.get(itn + url, function(res) {
            res.on('data', function(chunk) {
                chunks.push(chunk);
            });
            res.on('end', function() {
                urls.push(url);
                fs.appendFile('urls.txt', url + '\r\n', 'utf8');
                var data = Buffer.concat(chunks).toString(),
                    $ = cheerio.load(data),
                    needScrap = [];
                $('script').each(function(i, v) {
                    var src = $(this).attr('src');
                    if (src.length && js.indexOf(src) < 0) {
                        js.push(src);
                        fs.appendFile('js.txt', src + '\r\n', 'utf8');
                    }
                });
                $('link[rel="stylesheet"]').each(function(i, v) {
                    var h = $(this).attr('href');
                    if (h.length && css.indexOf(h) < 0) {
                        css.push(h);
                        fs.appendFile('css.txt', h + '\r\n', 'utf8');
                    }
                });
                $('a').each(function(i, v) {
                    var href = $(this).attr('href'),
                        isHref = /^\/\w/.test(href);
                    if (isHref && urls.indexOf(url) < 0) {
                        needScrap.push(href);
                    }
                });
                if (needScrap.length) {
                    for (var i = 0, len = needScrap.length; i < len; i++) {
                        get(needScrap[i]);
                    }
                } else {
                    console.log('urls: ', urls.length);
                }
            });
        });
    }

}

http.get(itn, function(res) {
    var chunks = [];
    res.on('data', function(chunk) {
        chunks.push(chunk);
    });
    res.on('end', function() {
        urls.push('/');
        fs.appendFile('urls.txt', '/' + '\r\n', 'utf8');
        var data = Buffer.concat(chunks).toString();
        var $ = cheerio.load(data);
        $('script').each(function(i, v) {
            var src = $(this).attr('src');
            if (src.length) {
                js.push(src);
                fs.appendFile('js.txt', src + '\r\n', 'utf8');
            }
        });
        $('link[rel="stylesheet"]').each(function(i, v) {
            var h = $(this).attr('href');
            if (h.length) {
                css.push(h);
                fs.appendFile('css.txt', h + '\r\n', 'utf8');
            }
        });
        $('a').each(function(i, v) {
            var href = $(this).attr('href'),
                isHref = /^\/\w/.test(href);
            if (isHref) {
                get(href);
            }
        });
    });
});

app.listen(3000, function() {
    console.log('begin listen');
});