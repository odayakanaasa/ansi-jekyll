var gulp           = require('gulp');
var browserSync    = require('browser-sync');
var responsive     = require('gulp-responsive');
var image          = require('gulp-image');
var rename         = require ('gulp-rename');
const fs           = require('fs');
var concat         = require('gulp-concat');
const gutil        = require('gulp-util');
var gulpif         = require('gulp-if');
const recursiveReadSync = require('recursive-readdir-sync');
const imgsize        = require('image-size');
const merge          = require('deepmerge');
const yaml           = require('js-yaml');
const pump           = require('pump');
const uglify         = require('gulp-uglify');
var purify           = require('gulp-purifycss');
var nano           = require('gulp-cssnano');

var sass           = require('gulp-sass');
var postcss        = require('gulp-postcss');
var autoprefixer   = require('autoprefixer');
var pxtorem        = require('postcss-pxtorem');
var orderedValues  = require('postcss-ordered-values');
var colorHexAlpha  = require("postcss-color-hex-alpha");
var responsiveType = require("postcss-responsive-type");
var debug          = require('postcss-debug').createDebugger();

gulp.task('images', function () {
  gulp.src('./assets/**/*.*')
   .pipe(image({
        pngquant: true,
        optipng: false,
        zopflipng: true,
        jpegRecompress: false,
        jpegoptim: true,
        mozjpeg: true,
        gifsicle: true,
        svgo: true,
        concurrent: 10
      }))
    .pipe(gulp.dest('./assets'));
});

gulp.task('images-all-webp', function () {
  'use strict';
return gulp.src(['_resources/uploaded/rooms/**/*.{png,jpg}'])
    // Use configuration
    .pipe(responsive({
      '**/*.{png,jpg}': [{
        width: 1,
        height: 1,
        rename: { 
          suffix: '-thumb',
          extname: '.webp'},
        format: 'webp',
      },
      {
        width: 268,
        rename: { 
          suffix: '-medium' ,
          extname: '.webp'},
        format: 'webp',
      },
      {
        width: 552,
        rename: { 
          suffix: '-large' ,
          extname: '.webp'},
        format: 'webp',
      },
      {
        height: 960,
        rename: { 
          suffix: '-portrait' ,
          extname: '.webp'},
        format: 'webp',
      },
      {
        width: 1440,
        rename: { 
          suffix: '-full' ,
          extname: '.webp'},
        format: 'webp',
      }]
    },{
      errorOnEnlargement: false,
      quality: 80,
      withMetadata: false,
      compressionLevel: 7
    }))
    .pipe(gulp.dest('assets/rooms2/'));
});

gulp.task('images-all-jpg', function () {
  'use strict';
return gulp.src(['_resources/uploaded/rooms/**/*.{png,jpg}'])
    // Use configuration
    .pipe(responsive({
      '**/*.{png,jpg}': [{
        width: 1,
        height: 1,
        rename: { 
          suffix: '-thumb'}
      },
      {
        width: 268,
        rename: { 
          suffix: '-medium' }
      },
      {
        width: 552,
        rename: { 
          suffix: '-large' }
      },
      {
        height: 960,
        rename: { 
          suffix: '-portrait' }
      },
      {
        width: 1440,
        rename: { 
          suffix: '-full' }
      }]
    },{
      errorOnEnlargement: false,
      quality: 80,
      withMetadata: false,
      compressionLevel: 7
    }))
    .pipe(gulp.dest('assets/rooms2/'));
});
/*
       _           _
 _ __ | |__   ___ | |_ ___  ___
| '_ \| '_ \ / _ \| __/ _ \/ __|
| |_) | | | | (_) | || (_) \__ \
| .__/|_| |_|\___/ \__\___/|___/
|_|
*/

// Containers for image data processing which is kicked off by gulp
// but aren't actually gulp tasks. Adapted from http://stackoverflow.com/a/18934385
// We don't need a recursive function since we know the structure.
// Create object: {
//   'album name' : {
//     'title': (directory name without the date)
//     'date': (directory name without the name)
//     'contents': [ (an array of photo objects, to be sorted by date)
//       {
//         properties pulled from EXIF data and image size
//       }
//     ]
// }
const walkPhotos = (path, index) => {
  const directory = fs.readdirSync(path);

  // Directory is going to be an array of album directories
  for (var i = 0; i < directory.length; i++) {
    // This is the directory name from Lightroom ('2015-12-31 New Years Eve' style)
    const album = directory[i];

    // This is the directory shortname Gulp is using for image output.
    const dirname = album;

    // This will be the image contents and any subdirectories
    const photos = recursiveReadSync(path + '/' + album);
    const contains = [];

    for (var j = 0; j < photos.length; j++) {
      // recursiveReadSync returns the path relative to the CWD, not just the name
      // like fs.readdirSync so this will be /source/Photography/.../whatever.img
      const photo = photos[j];

      // So split on / and take the last component for the filename.
      const file = photo.split('/').pop();

      // Original images are sometimes in subdirectories by day or activity, which
      // is why we recused the whole thing. Don't try to get stats on a directory,
      // just skip it.
      if (fs.statSync(photo).isDirectory()) { continue; }

      const dimensions = imgsize(photo);

      const photoBuffer = fs.readFileSync(photo);


      var orientvar = 'landscape'

      if (dimensions.width < dimensions.height) {
         var orientvar = 'portrait';
      } 


      contains.push({
        filename: file,
        width: dimensions.width || null,
        height: dimensions.height || null,
        orientation: orientvar
      });
    }

    index[dirname] = {
      contents: contains
    };
  }

  // Now sort all photos in each album by the date of the exposure instead
  // of the name. We do this here because:
  // - The existing index file (which has custom data) is already sorted
  // - Sorted albums are arrays, not objects. So if the order here doesn't
  //   match what's in the generated file, custom attributes will be applied
  //   to the wrong image when merging (because arrays are indexed, not keyed).
  //   ^^ @TODO: That'll fix most of the issue, but inserting/deleting within
  //      an existing album will still cause attributes to shift. :(
  for (var album in index) {
    if (!index.hasOwnProperty(album)) { continue; }
    index[album].contents = index[album].contents.sort((a, b) => {
      if (a.date < b.date) { return -1; }
      if (a.date > b.date) { return 1; }
      return 0;
    });
  }
};


gulp.task('photos', function () {
  let index = {};
  const generatedIndex = {};
  try {
    index = fs.readFileSync('_data/photos/index.yml', {encoding: 'utf8'});
    index = yaml.safeLoad(index);
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      gutil.log('No original index found; will create one.');
    }
    else {
      throw e;
    }
  }
  walkPhotos('_resources/uploaded/rooms', generatedIndex);
  const mergedIndex = merge(index, generatedIndex);

  fs.writeFileSync('_data/photos/index.yml', yaml.safeDump(mergedIndex));
});

gulp.task('photos-resized', function () {
  let index = {};
  const generatedIndex = {};
  walkPhotos('assets/rooms2', generatedIndex);
  const mergedIndex = merge(index, generatedIndex);

  fs.writeFileSync('_data/photos/index-resized.yml', yaml.safeDump(mergedIndex));
});

gulp.task('js-compress', function (cb) {
  pump([
      gulp.src('_site/js/js-all.js'),
      uglify(),
      gulp.dest('assets/js/optimized')
    ],
    cb
  );
});


gulp.task('maincss', function() {
  return gulp.src(['./_site/assets/css/styles.css'])
    .pipe(nano())
    .pipe(gulp.dest('assets/css/optimized'))
    .pipe(gulp.dest('_includes/css'));
});


/**
 * Compile files from _resources/_scss into both [project-folder]/_site/css (for live injecting) and [project-folder]/css (for future jekyll builds)
 */
var config = {
    assetsDir: '_resources',
    bowerDir: '_resources/bower/bower.json',
    sassPattern: 'sass/**/*.scss',
    jsPattern: 'js/**/*.js'};

gulp.task('styles', function () {
  var processors = [
    autoprefixer({browsers: ['last 3 version']}),
    pxtorem({replace: false,selectorBlackList: ['btn-floating']}),
    colorHexAlpha(),
    responsiveType(),
  ];
   return gulp.src('./_sass/styles.scss')
        .pipe(sass({
            includePaths: ['scss']
        }).on('error', sass.logError))
        .pipe(postcss(debug(processors)))
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('./assets/css'));
});

