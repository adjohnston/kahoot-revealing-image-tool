#! /usr/bin/env node

var argv       = require('minimist')(process.argv.slice(2)),
    fs         = require('fs'),
    gm         = require('gm'),
    pngStream  = require('png-file-stream'),
    gifencoder = require('gifencoder');

// exec(compare -highlight-style assign -highlight-color purple -file userArgs[0])

//  kahoot-reveal --theme [default] --time [20sec] --file
//  for each frame of the revealing theme
  //  get the size of the users image
  //  resize the the revealing image frame
  //  set the delay based on the users requirement
  //  return animated gif

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
