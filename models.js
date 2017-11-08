const uuid = require('uuid');

function StorageException(message) {
	this.message = message;
	this.name = "StorageException";
}

const BlogPosts = {
	create: function(title, content, author, publishDate){
		const post = {
			id: uuid.v4(),
			title: title,
			content: content,
			publishDate: publishDate || Date.now(),
			author: author
		};
		this.post.push(post);
		return post;
	},
	get: function(id=null){
		if (id !== null) {
			return this.posts.find(post => post.id === id);
		}
		return this.posts.sort(function(a, b) {
			return b.publishDate - a.publishDate
		});
	},
	delete: function(id) {
		const postIndex = this.posts.findIndex(
			post => post.id === id);
		if (postIndex > -1) {
			this.posts.splice(postIndex, 1);
		}
	},
	update: function(updatedPost) {
		const {id} = updatedPost;
		const postIndex = this.posts.findIndex(
			post => post.id === updatedPost.id);
		if (postIndex === -1){
			throw StorageException(
				`Cant update item \`${id}\` because it is not there.`)
		}
		this.posts[postIndex] = Object.assign(
			this.posts[postIndex], updatedPost);
		return this.posts[postIndex];
	}
};

function createBlogPostsModel() {
	const storage = Object.create(BlogPosts);
	storage.posts = [];
	return storage;
}

module.exports = {BlogPosts: createBlogPostsModel()};