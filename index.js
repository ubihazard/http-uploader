#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const formidable = require('formidable');

http.createServer(function(req, res) {
  if (req.url == '/upload') {
    let form = new formidable.IncomingForm();
    let files = []; let fields = [];
    form.uploadDir = __dirname + '/uploads';
    form.multiples = true;
    form
      .on('field', function(field, value) {
        console.log(field, value);
        fields.push([field, value]);
      })
      .on('file', function(field, file) {
        console.log(field, file);
        files.push([field, file]);
      })
      .on('end', function() {
        console.log('-> Upload done');
        res.writeHead(200, {'content-type': 'text/html'});
        res.write('<html><head><meta http-equiv="refresh" content="10;url=/"/></head><body><p>Redirect in 10 seconds...</p><p>Received fields:</p><p>' + JSON.stringify(fields) + '</p>');
        res.end('<p>Received files:</p><p>' + JSON.stringify(files) + '</p></body></html>');
        files.forEach (f => {
          let file = f[1];
          try {
            fs.renameSync(file.filepath, process.cwd() + '/' + file.originalFilename);
          } catch (err) {
            try {
              fs.unlinkSync(file.filepath);
            } catch (err) {
              console.log('Could not remove: ' + file.filepath);
            }
          }
        });
      })
    ;
    form.parse(req);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><head><title>HTTP Uploader</title></head><body><form action="upload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filestoupload" multiple/><br/>');
    res.write('<input type="submit"/>');
    res.write('</form></body></html>');
    return res.end();
  }
}).listen(8080);
