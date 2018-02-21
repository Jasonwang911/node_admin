var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var md5 = require('md5-node');
var MongoStore = require('connect-mongo')(session);

var DB = require('./modules/db.js');

var MongoClient = require('mongodb').MongoClient;
var DbUrl = 'mongodb://127.0.0.1:27017/productmanage';

var app = express();

// 设置session
app.use(session({
	secret: 'keybord',
	name: 'jasonId',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 30
	},
	rolling: true,
	store: new MongoStore({
		url: DbUrl, // 数据库的地址
		touchAfter: 24 * 3600 // 
	})
}))

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(bodyParser.json());

// 托管静态文件目录为public
app.use(express.static('public'));

// ejs模板引擎默认使用views目录
app.set('view engine', 'ejs');

// 自定义中间件，判断登陆状态
app.use((req, res, next) => {
	console.log('url:' + req.url);
	if (req.url == '/login' || req.url == '/doLogin') {
		next();
	} else {
		console.log(!req.session.userinfo)
		if (req.session.userinfo && req.session.userinfo.username != '') {
			// ejs中公用数据
			app.locals['userinfo'] = req.session.userinfo;
			next();
		} else {
			console.log('session中没有userinfo，开始重定向')
			res.redirect('/login');
		}
	}

});

app.get('/', (req, res) => {
	res.render('product');
});

app.get('/login', (req, res) => {
	res.render('login');
});

// 获取登陆提交的数据
app.post('/doLogin', (req, res) => {
	console.log(req.body);
	var username = req.body.username;
	var password = md5(req.body.password);

	DB.find('user', {
		username,
		password
	}, (data) => {
		console.log(data);
		if (data.length > 0) {
			console.log('登录成功');
			//保存用户信息
			req.session.userinfo = data[0];

			res.redirect('/product');
			// 登录成功跳转到商品列表

		} else {
			//console.log('登录失败');
			res.send("<script>alert('登录失败');location.href='/login'</script>");
		}
	});

	// MongoClient.connect(DbUrl, (err, db) => {
	// 	if (err) {
	// 		console.log(err);
	// 		return;
	// 	}

	// 	var result = db.collection('user').find({
	// 		username,
	// 		password
	// 	});

	// 	result.toArray((error, data) => {
	// 		if (error) {
	// 			console.log(error);
	// 			return;
	// 		}
	// 		console.log(data);
	// 		if (data.length > 0) {
	// 			console.log('登录成功');
	// 			//保存用户信息
	// 			req.session.userinfo = data[0];

	// 			res.redirect('/product'); 登录成功跳转到商品列表

	// 		} else {
	// 			//console.log('登录失败');
	// 			res.send("<script>alert('登录失败');location.href='/login'</script>");
	// 		}
	// 		db.close();
	// 	});

	// 	// 使用遍历查询结果的方式获取查询结果
	// 	// var list = [];
	// 	// result.each((error, doc) => {
	// 	// 	if (error) {
	// 	// 		console.log(error);
	// 	// 	} else {
	// 	// 		if (doc != null) {
	// 	// 			list.push(doc);
	// 	// 		} else {
	// 	// 			console.log(list);
	// 	// 			db.close();
	// 	// 		}
	// 	// 	}
	// 	// });

	// });
});

app.get('/loginOut', (req, res) => {
	req.session.destroy((err) => {
		if (err) throw err;

		res.redirect('/login');
	});
});

app.get('/product', (req, res) => {

	DB.find('product', {}, (data) => {
		console.log(data)
		res.render('product', {
			list: data
		});
	});

	// MongoClient.connect(DbUrl, (err, db) => {
	// 	if (err) {
	// 		console.log(err);
	// 		return;
	// 	}
	// 	var result = db.collection('product').find();

	// 	result.toArray((error, data) => {
	// 		if (error) {
	// 			console.log(error);
	// 			return;
	// 		}
	// 		res.render('product', {
	// 			list: data
	// 		});
	// 		db.close();
	// 	});
	// });
});

app.get('/productadd', (req, res) => {
	res.render('productadd');
});

app.get('/productedit', (req, res) => {

});

app.get('productdelte', (req, res) => {

});

app.listen(7000);