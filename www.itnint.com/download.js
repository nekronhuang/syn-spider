var http = require('http'),
    cheerio = require('cheerio'),
    app = require('express')(),
    fs = require('fs'),
    async = require('async'),
    path = require('path');

console.time('it');

var itn = 'http://www.itnint.com';

var resources = [{
    file: 'css.txt',
    status: 1
}, {
    file: 'js.txt',
    status: 1
}, {
    file: 'urls.txt',
    status: 1
}];

async.series([
    function(next) {
        if (resources[0].status) return next();
        fs.readFile(resources[0].file, 'utf8', function(err, content) {
            var lines = content.split('\r\n');
            lines.pop();
            async.each(lines, function(line, cb) {
                var chunks = [];
                http.get(itn + line, function(res) {
                    res.on('data', function(chunk) {
                        chunks.push(chunk);
                    });
                    res.on('end', function() {
                        fs.writeFile('./public' + line, Buffer.concat(chunks), cb);
                    });
                });
            }, next);
        });
    },
    function(next) {
        if (resources[1].status) return next();
        fs.readFile(resources[1].file, 'utf8', function(err, content) {
            var lines = content.split('\r\n');
            lines.pop();
            async.each(lines, function(line, cb) {
                var chunks = [];
                http.get(itn + line, function(res) {
                    res.on('data', function(chunk) {
                        chunks.push(chunk);
                    });
                    res.on('end', function() {
                        fs.writeFile('./public' + line, Buffer.concat(chunks), cb);
                    });
                });
            }, next);
        });
    },
    function(next) {
        if (resources[2].status) return next();
        fs.readFile(resources[2].file, 'utf8', function(err, content) {
            var lines = content.split('\r\n');
            lines.pop();
            async.each(lines, function(line, cb) {
                var chunks = [],
                    file = line.match(/[\w\-]+/);
                http.get(itn + '/' + file, function(res) {
                    res.on('data', function(chunk) {
                        chunks.push(chunk);
                    });
                    res.on('end', function() {
                        file = file ? file + '.html' : 'index.html';
                        fs.writeFile('./public/' + file, Buffer.concat(chunks), cb);
                    });
                });
            }, next);
        });
    },
    function(next){
        // return next();
        var result = [];
        (function travel(dir) {
            fs.readdirSync(dir).forEach(function(file) {
                var pathname = path.join(dir, file);
                if (fs.statSync(pathname).isDirectory()) {
                    travel(pathname);
                } else {
                    if (file.match(/.css$/) || file.match(/.html$/)) {
                        var content = fs.readFileSync(pathname, 'utf8'),
                            imgs = content.match(/img\/.+\.\w{3,4}/g);
                        if (imgs) {
                            imgs.forEach(function(v, i) {
                                if (result.indexOf(v) < 0) result.push(v);
                            });
                        }
                    }
                }
            });
        })('./public')
        console.log(result);
        async.each(result, function(img, cb) {
            var chunks = [];
            if(fs.existsSync('./public/'+img)) return cb();
            http.get(itn + '/' + img, function(res) {
                res.on('data', function(chunk) {
                    chunks.push(chunk);
                });
                res.on('end', function() {
                    console.log(img, 'done');
                    fs.writeFile('./public/' + img, Buffer.concat(chunks), cb);
                });
            });
        }, next);
    }
], function(err) {
    if (err) console.error(err);
    console.timeEnd('it');
});

app.listen(3000);