exports.DATABASE_URL = 	process.env.DATABASE_URL ||
						global.DATABASE_URL ||
						'mongod://127.0.0.1/blog-app';
exports.PORT = process.env || 8080;