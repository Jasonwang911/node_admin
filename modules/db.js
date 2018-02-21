var MongoClient = require('mongodb').MongoClient;
var DbUrl = 'mongodb://127.0.0.1:27017/productmanage';

function __connectDb(callback) {

	MongoClient.connect(DbUrl, (err, db) => {
		if (err) {
			console.log('数据库连接失败');
			return;
		}


		// 包含 增、删、改、查
		callback(db);

	});
}

// 数据库查询
// DB.find('user',{}, callBack);
exports.find = function(collectionname, json, callback) {

	__connectDb((db) => {


		var result = db.collection(collectionname).find(json);
		result.toArray((error, data) => {
			if (error) {
				console.log('数据库查询失败');
			}
			db.close();
			callback(data); // 拿到数据执行回调函数
		});
	});


	// MongoClient.connect(DbUrl, (err,db) => {
	// 	if(err) {
	// 		console.log('数据库连接失败');
	// 		return;
	// 	}

	// 	db.collection(collectionname).find(json);

	// 	callback();

	// });
}