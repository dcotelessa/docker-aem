/* ********************************** */
/* Dependencies                       */
/* ********************************** */
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var path = require('path');
var spawn = require('child_process').spawn;
var config = require('./gulp.config')();
var fs = require('fs');
var argv = require('yargs')
    .count('silent')
    .alias('s', 'silent')
    .argv;

var SILENCE_LEVEL = argv.silent;
var isSlangLog = !(SILENCE_LEVEL >= 1);
var portNumber = argv.port || 4502;

//Placeholder
var onlyPath = argv.opath;
overrideConfigPath(onlyPath);

//Error handler for css reporters
function errorAlertReporter(err) {
  console.log(err.toString());
  this.destroy();
}

function existsSync(filePath){
  try{
    fs.statSync(filePath);
  }catch(err){
    if(err.code == 'ENOENT') return false;
  }
  return true;
};

function overrideConfigPath(newPath) {
  var cmod, pkeys = ['lessAll','lessAllComplete','markupCoreComplete','jsCoreComplete'];

  if (typeof newPath === 'undefined') {
    return;
  }
  if (newPath.indexOf('project/aem-dre/branches/releases/1.0/dre-content/src/main/content/jcr_root') !== 0 || !(existsSync(newPath))) {
    console.log('directory not a sub of jcr_root, or doesn\'t exist');
    process.exit(1);
    return;
  }

  for (x in config.srcPaths) {
    if (pkeys.some(function(el){return el===x;})) {
      cmod = config.srcPaths[x];
      if (Array.isArray(cmod)) {
        cmod = cmod.shift();
        if (x === 'jsCoreComplete') {
          config.srcPaths[x].shift();
        }
      }
      cmod = '**/'+cmod.split('/').pop();
      cmod = (newPath.endsWith('/')) ? cmod : '/'+cmod;
      cmod = newPath + cmod;
      cmod = cmod.replace(/(etc|apps)/g, '**');
      if (Array.isArray(config.srcPaths[x])) {
        config.srcPaths[x].unshift(cmod);
      } else {
        config.srcPaths[x] = cmod;
      }

    }
  }
}


/* ********************************** */
/* TASKS:                             */
/* ********************************** */

gulp.task('default', ['watch', 'markupCopy', 'jsCopy', 'cssCopy', 'txtCopy'], function() {
  console.log("Script initialized");
});

gulp.task('ty', function() {
  console.log(config.srcPaths);
});

/* ================================== */
/* Javascript Tasks:                  */
/* ================================== */

gulp.task('jsCopy', function() {
  var stream = gulp.src(config.srcPaths.js)
    .pipe(plugins.cached('jsCopyCache'))
    .pipe(plugins.slang(config.destPaths.root,{showlogsuccess:isSlangLog, port:portNumber}));
  return stream;
});

/* ================================== */
/* Less/CSS Tasks:                    */
/* ================================== */

gulp.task('lessProc', ['lessLint'], function() {
  var stream = gulp.src(config.srcPaths.lessAll)
    .pipe(plugins.less())
    .pipe(gulp.dest(config.destPaths.sbase));
  return stream;
});

gulp.task('lessLint', function() {
  var stream = gulp.src(config.srcPaths.lessAll)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.less())
    .on('error', errorAlertReporter);
  return stream;
});

gulp.task('cssCopy', ['lessProc'], function() {
  var stream = gulp.src(config.srcPaths.css)
    .pipe(plugins.cached('cssCopyCache'))
    .pipe(plugins.slang(config.destPaths.root,{showlogsuccess:isSlangLog, port:portNumber}));
  return stream;
});

/* ================================== */
/* Markup (HTML) Tasks:               */
/* ================================== */

gulp.task('markupCopy', function() {
  var stream = gulp.src(config.srcPaths.html)
    .pipe(plugins.cached('markupCopyCache'))
    .pipe(plugins.slang(config.destPaths.root,{showlogsuccess:isSlangLog, port:portNumber}));
  return stream;
});

gulp.task('templateCopy', function() {
  var stream = gulp.src(config.srcPaths.tpl)
    .pipe(plugins.cached('templateCopyCache'))
    .pipe(plugins.slang(config.destPaths.root,{showlogsuccess:isSlangLog, port:portNumber}));
  return stream;
});

/* ================================== */
/* Support (XML, TXT) Tasks:          */
/* ================================== */

gulp.task('txtCopy', function() {
  var stream = gulp.src(config.srcPaths.xmltxt)
    .pipe(plugins.cached('txtCopyCache'))
    .pipe(plugins.slang(config.destPaths.root,{showlogsuccess:isSlangLog, port:portNumber}));
  return stream;
});

/* ================================== */
/* Watch Tasks:                       */
/* ================================== */

// FYI: Not all copied files are being linted
gulp.task('watch', function() {
  gulp.watch(config.srcPaths.js, ['jsCopy']);
  gulp.watch(config.srcPaths.lessAllComplete, ['cssCopy']);
  gulp.watch(config.srcPaths.html, ['markupCopy']);
  gulp.watch(config.srcPaths.xmltxt, ['txtCopy']);
});

/* ================================== */
/* Import Tasks:                      */
/* ================================== */

// This abstracts the vault export tool, which pulls code from AEM to your local directory
// IMPORTANT!!! - any time before you run this command make sure you have checked in files
// just in case you need to roleback. If the AEM instance is out of sync it can and will
// overwrite your local files. Protect yourself.  You have been warned.
gulp.task('vltX', function(cb) {
  var vltx = spawn('vlt', ['--credentials', 'admin:admin', 'export', 'http://localhost:4502/crx', '/', './project/aem-dre/branches/releases/1.0/src/main/content/jcr_root']);
  vltx.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  vltx.on('exit', function(code) {
    cb(code === 0 ? null : 'ERROR: VLT process exited with code: '+code);
  });
});

/* ================================== */
/* Helper Tasks:                      */
/* ================================== */

gulp.task('help', plugins.taskListing);
//when you want to differentiate subtasks add _ or : to task names
//or if you want to differentiate subtasks on a custom basis:
//gulp.task('help', plugins.taskListing.withFilters(/^_/));
