var http = require('http'),
    express =require('express'),
    app = express();

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.redirect('/index.html');
});

app.get('/*.aspx',function(req,res){
    var p=req.path.replace('aspx','html');
    res.redirect(p);
});

app.listen(3000,function(){
    console.log('ok');
});