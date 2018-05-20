# nodejs

## 改名脚本
```js
fs.readdir('.',(err, files) => {
  files.forEach(f=>{
     var newf = f.replace('Screenshot_','').replace('_com.xxx','');
     
     console.log('## ' + newf.substr(0,16));
     
     newf =  newf.replace(/-/g,'').substr(0,12) + ".png";

     console.log('![](./img/' + newf+')\n');
     
     fs.rename(f, newf);
  });
}); 
```


## 返回json

```js
var http = require('http');
var data = {key: 'value', hello: 'world'};

var srv = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(data));
});

srv.listen(8080, function() {
  console.log('listening on localhost:8080');
});
```

## 返回普通文本

```js
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
```

