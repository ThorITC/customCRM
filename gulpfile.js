var gulp = require('gulp'),
	concatCss=require('gulp-concat-css'),
	concat=require('gulp-concat'),
	jsmin = require('gulp-jsmin'),
	uglify = require('gulp-uglify'),
	cssnano=require('gulp-cssnano');

var styles=[
	'bower_components/angular-tooltips/dist/angular-tooltips.min.css',
	'css-dev/*.css',
	'bower_components/materialize/bin/materialize.css',
	'bower_components/ng-img-crop/compile/minified/ng-img-crop.css',
	'bower_components/sweetalert/dist/sweetalert.css'
];


var req=[
	'bower_components/jquery/dist/jquery.min.js',
	'bower_components/angular/angular.min.js',
	'bower_components/angular-materialize/src/angular-materialize.js',
	'bower_components/angular-cookie/angular-cookie.js',
	'bower_components/angular-route/angular-route.min.js',
	'bower_components/sweetalert/dist/sweetalert.min.js',
	'bower_components/ng-img-crop/compile/minified/ng-img-crop.js',
	'bower_components/angular-tooltips/dist/angular-tooltips.min.js',
	'bower_components/materialize/bin/materialize.js',
	'bower_components/angular-file-upload/dist/angular-file-upload.min.js',
	'bower_components/angular-clipboard/angular-clipboard.js',
	'bower_components/AutoComplete/dev/autocomplete.js'
];
var app=[
	'app/newsModule/module.js',
	'app/newsModule/service.js',
	'app/newsModule/controller.js',
	'app/MainModule/MainModule.js',
	'app/MainModule/FaviconService.js',
	'app/UserModule/UserModule.js',
	'app/UserModule/AccessService.js',
	'app/UserModule/UserService.js',
	'app/UserModule/UserController.js',
	'app/UserModule/UserViewController.js',

	'app/MainModule/ErrorController.js',
	'app/MainModule/MainDirectives.js',
	'app/MainModule/MainController.js',
	'app/MainModule/CryptService.js',
	'app/MainModule/headerDir.js',
	'app/MainModule/MainConfig.js',
	'app/UserModule/ProfileController.js',
	'app/UserModule/autocomleteDirective.js',
	'app/MainModule/themeDirective.js',
	'app/UserModule/passwordInputDirective.js',
	'app/UserModule/UserListService.js',
	'app/UserModule/UserListController.js',
	'app/UserModule/SettingController.js',
	'app/IntranetModule/IntranetModule.js',
	'app/IntranetModule/IntranetService.js',
	'app/IntranetModule/IntranetDirective.js',
	'app/IntranetModule/IntraFilter.js',
	'app/IntranetModule/IntraController.js',
];

gulp.task('styles',function(){
	gulp.src(styles)
	.pipe(concatCss('bundle.css'))
	//.pipe(cssnano())
	.pipe(gulp.dest('css'));
});

gulp.task('requirences', function() {
    gulp.src(req)
				.pipe(jsmin())
				//.pipe(uglify())
        .pipe(concat('req.js'))
        .pipe(gulp.dest('js'))
});

gulp.task('app',function(){
	gulp.src(app)
			//.pipe(jsmin())
			.pipe(concat('app.js'))
			.pipe(gulp.dest('js'))
});

gulp.task('autocomplete',function(){
	gulp.src(['app/AutoComplete/autocomplete.js'])
		.pipe(jsmin())
		.pipe(uglify())
		.pipe(concat('autocomplete.min.js'))
		.pipe(gulp.dest('app/AutoComplete/'))
});

gulp.task('watch',function(){
	gulp.watch('app/**/*.js', ['app']);
	gulp.watch('css-dev/*.css',['styles']);
})
