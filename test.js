#! /usr/bin/env node

var argv       = require('minimist')(process.argv.slice(2)),
    fs         = require('fs'),
    gm         = require('gm'),
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


encoder.createReadStream().pipe(fs.createWriteStream('myanimated.gif'));
encoder.start();
encoder.setRepeat(0);
encoder.setDelay(2000); // get the time and calculate correctly todo
encoder.setQuality(10);

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
            .write('.tmp/temp-composite_' + i + '.png', function (err) {
              if (err) throw err;
            });
        });

      encoder.addFrame(fs.readFileSync('.tmp/temp-composite_' + i + '.png'));
    });
  });

  // themeFrames.forEach(function (frame, i) {
  //   gm()
  //     .command('composite')
  //     .in('.tmp/temp_' + i + '.miff')
  //     .in(image)
  //     .write('composite.png', function (err) {
  //       if (err) throw err;
  //     })
  // });

encoder.finish();
