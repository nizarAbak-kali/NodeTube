var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// routes sections
var routes = require('./routes/index');
var users = require('./routes/users');


var express = require('express');
var jsdom = require('jsdom'),
    request = require('request'),
    url = require('url'),
    app = express();
// middle ware
app.listen(3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/nodetube', function (req, res) {
    //Tell the request that we want to fetch youtube.com, send the results to a callback function
    request({
            uri: 'http://youtube.com'
        },
        function (err, response, body) {
            var self = this;
            self.items = new Array();//I feel like I want to save my results in an array

            //Just a basic error check
            if (err && response.statusCode !== 200) {
                console.log('Request error.');
            }
            //Send the body param as the HTML code we will parse in jsdom
            //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
            jsdom.env({
                html: body,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    //Use jQuery just as in a regular HTML page
                    var $ = window.jQuery,
                        $body  = $('body');
                        $videos = $body.find('.yt-lockup-thumbnail');

                    $videos.each(function(i,item){
                        //selector Jquery classique
                        // premiere ancre qui est l'enfant de video-entry
                        var $a = $(item).children('a'),
                        // titre de la video
                            $tmp_title = $(item).find('.yt-lockup-title .contains-action-menu'),
                            $title = $tmp_title.find('a').attr('title'),
                        // durée de la video
                            $time = $a.find('.video-time').text(),
                            // miniature de la video
                            $img = $a.find('span.yt-thumb-simple img');
                        // de la donnée que je vais mettre dans le tableau items
                        //console.log(url.parse($a.attr('href'),true).toString());
                        self.items[i]={
                            href: $a.attr('href'),
                            //tile: $title.trim(),
                            tile: $title,
                            time: $time,
                            thumbnail: $img.attr('data-thumb') ? $img.attr('data-thumb') : $img.attr('src'),
                            urlObj: $a.attr('href')
                            //urlObj: url.parse($a.attr('href').toString(),true)
                        };

                    });

                  res.render('list',{
                     title: 'NodeTube',
                      items: self.items
                  });
                }
            });
        });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
