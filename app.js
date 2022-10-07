const config = require('./config');
const express = require('express');
const expressHbs = require('express-handlebars');
const mysql = require('mysql2')

const app = express();

// view engine settings
app.engine("hbs", expressHbs.engine(
    {
        layoutsDir: "views/layouts", 
        defaultLayout: "main",
        extname: "hbs"
    }
))

// static files
app.use(express.static(__dirname + '/public'));

// connection with DB
const connection = mysql.createConnection({
    host: 'localhost',
    user: config.DB_USER,
    database: config.DB_NAME,
    password: config.DB_PASSWORD
});

connection.connect()

// cookie and sessions
app.use(require('cookie-parser')(config.SECRET));

app.use(require('express-session')({
    resave: false,
    saveUnitialized: false,
    secret: config.SECRET
}));

// adding body-parser
app.use(require('body-parser').urlencoded({'extended': false}));

// routes
app.get('/', function(req, res){
    if (req.session.user) {
        res.render('index.hbs')
    } else {
        res.redirect(301, '/login')
    }
});

app.get('/login', function(req, res){
    res.render('login.hbs');
});

app.get('/register', function(req, res){
    res.render('register.hbs');
});


// POST'S
app.post('/login', function(req, res){
    connection.query('select * from users where login=? and password=?;', 
        [req.body.login, req.body.password], function(err, result){
            if (err || !result.length) {
                console.log('Error!');
                res.redirect(301, '/login')
            } else {
                console.log(`Login ${req.body.login}`);
                req.session.user = result[0]
                res.redirect(301, '/')
            }
        });
});

app.post('/register', function(req, res){
    connection.query('insert into users(login, password) values(?, ?);', 
        [req.body.login, req.body.password], function(err){
            if (err) {
                console.log(err.message);
                res.redirect(301, '/register')
            } else {
                console.log(`User (${req.body.login}, ${req.body.password}) was inserted\n`);
                res.redirect(301, '/logins')
            }
        });
});

app.post('/', function(req, res){
    connection.query('insert into messages(chatId, fromId, toId, message) values(?, ?, ?, ?)',
        [34, req.session.user.id, 7, req.body.message], function(err){
            if (err) {
                console.log(err.message);
            } else {
                console.log(`Sending "${req.body.message}" to ${req.body.to}`);
            }
        });
    res.redirect(301, '/'); 
});

app.listen(config.PORT)