var gulp = require('gulp');
var less = require('gulp-less');
var sass = require('gulp-sass');
var cleancss = require('gulp-clean-css');
var rename = require('gulp-rename');
var concatCss = require('gulp-concat-css');
/*对文件名加MD5后缀*/
var rev=require('gulp-rev');
/*路径替换*/
var revColloctor=require('gulp-rev-collector');
//防止来自gulp插件的错误造成pipe被破坏
var plumber = require('gulp-plumber');  
//图片压缩模块
var imagemin=require('gulp-imagemin');
var pngquant =require('imagemin-pngquant');
var cache = require('gulp-cache');

var uglify = require('gulp-uglify');

var clean=require('gulp-clean');
//同屏浏览
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
//配置文件
var config = require("./config");
var program = config.program_2;

//编译scss文件
gulp.task('scss', function () {
    return gulp.src(program.main+config.app+config.scss+'**/*.scss')
        .pipe(plumber())
        .pipe(sass.sync().on('error',sass.logError))
        .pipe(sass({outputStyle:'compact'}))
        .pipe(gulp.dest(program.main+config.app+config.css))
        .pipe(reload({
            stream: true
        }));
});

/*css文件合并、压缩、重命名*/
gulp.task('cssmin',function(){
        return gulp.src(program.main+config.app+config.css+"*.css")
            .pipe(gulp.dest(program.main+config.dist+config.css))
            .pipe(concatCss(program.merge_name))
            .pipe(cleancss({
                debug:true,
                compatibility: 'ie8'
            }))
            .pipe(rev())  // 文件名加MD5后缀
            .pipe(gulp.dest(program.main+config.dist+config.css))
            .pipe(rev.manifest())
            .pipe(gulp.dest(program.main+config.rev));   //将 rev-manifest.json 保存到 rev 目录内
            /*.pipe(reload({
                        stream:true
                    }))*/
});

//替换文件中的css路径
/*在项目完成以后需要维护时，为了避免缓存需要给文件添加后缀，同事替换html中的的文件。操作是在serve任务中的watch监听scss的变化中添加rev任务*/
gulp.task('rev',['cssmin'],function(){
        gulp.src([program.main+config.rev+'*.json',program.main+config.app+'*.html'])
        .pipe(revColloctor())
        .pipe(gulp.dest(program.main+config.dist));
});

/*图片压缩*/
/*只压缩修改的图片。压缩图片时比较耗时，在很多情况下我们只修改了某些图片，没有必要压缩所有图片，使用”gulp-cache”只压缩修改的图片，没有修改的图片直接从缓存文件读取（C:\Users\Administrator\AppData\Local\Temp\gulp-cache）。*/
gulp.task('imagemin',function(){
    return gulp.src(program.main+config.app+config.img+'*.{png,jpg,gif,ico,svg}')
                .pipe(cache(imagemin({
                     /*optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
                        progressive: false, //类型：Boolean 默认：false 无损压缩jpg图片
                        interlaced: false, //类型：Boolean 默认：false 隔行扫描gif进行渲染
                        multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化*/
                        /*深度压缩图片*/
                        progressive:true,
                        svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
                        use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
                })))
                .pipe(gulp.dest(program.main+config.dist+config.img));
});

/*有时候，您可能只是想完全重新加载页面 (例如，处理一堆JS文件后), 但您希望在任务发生后重载。*/
gulp.task('js',function(){
    return gulp.src(program.main+config.app+config.js+'*.js')
        .pipe(uglify())
        .pipe(gulp.dest(program.main+config.dist+config.js));
});
/*创建一个任务确保JS任务完成之前能够继续响应*/
/*浏览器重载*/
gulp.task('js-watch',['js'],reload);

//将html页面进行处理放入dist中
gulp.task('html',function() {
    return gulp.src(program.main+config.app+"*.html")
        .pipe(plumber())        
        .pipe(gulp.dest(program.main+config.dist))
        .pipe(browserSync.stream());
});
//删除dist的目录以及不需要的文件
gulp.task("clean",function(){
    return gulp.src([program.main+config.dist,program.main+config.rev])
                .pipe(clean())
});
//删除cass编译的css文件
gulp.task("cleanScss",function(){
    return gulp/src(config.app+config.css).pipe(clean());
})

/*代理服务器+监听scss/html文件*/
gulp.task('serve', ['scss','js'], function () {
    browserSync.init({
        server: program.main+config.app
    });
    
    gulp.watch(program.main+config.app+config.scss+'/**/*.scss', ['scss']);
    // gulp.watch(program.main+config.app+config.js+'*.js',['js-watch']);
    gulp.watch(program.main+config.app+config.js+'*.js',reload);
    gulp.watch(program.main+config.app+'*.html',function(){
        reload();
    });
});

//默认是开发模式
gulp.task('default', ['serve']);
//生产模式
gulp.task('build',['clean'],function(){
    gulp.start('rev','js','imagemin');
});