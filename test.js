#! /usr/bin/env node

var argv       = require('minimist')(process.argv.slice(2)),
    fs         = require('fs'),
    gm         = require('gm'),
    pngStream  = require('png-file-stream'),
    gifencoder = require('gifencoder');
    

var image       = argv.image,
    imageStream = fs.createReadStream(image),
    themeName   = argv.theme || 'default',
    themeDir    = './themes/' + themeName + '/',
    themeFrames = fs.readdirSync(themeDir, getFiles).filter(getFrames).sort(),
    encoder     = new gifencoder(640, 640);


function getFiles(err, files) {
  if (err) throw err;

  return files;
}

function getFrames(frame) {
  if (frame.indexOf('theme_') !== -1) return frame;
}


gm(imageStream)
  .size(function (err, size) {
    if (err) throw err;

    themeFrames.forEach(function (frame, i) {
      var frameStream  = fs.createReadStream(themeDir + frame);

      gm(frameStream)
        .resize(size.width, size.height)
        .write('.tmp/temp_' + i + '.miff', function (err) {
          if (err) throw err;

          gm()
            .command('composite')
            .in('.tmp/temp_' + i + '.miff')
            .in(image)
            .write('.tmp/temp_' + i + '.png', function (err) {
              if (err) throw err;
            });
        });
    });

    console.log('done');

    pngStream('.tmp/**/temp_?.png')
      .pipe(encoder.createWriteStream({repeat: 0, delay: 500, quality: 10 }))
      .pipe(fs.createWriteStream('animated_' + image + '.gif'));
  });
