const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const mongoose = require('mongoose');

const should = chai.should();

const {DATABASE_URL, TEST_DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');
const {closeServer, runServer, app} = require('../server');

chai.use(chaiHttp);

function tearDown() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  });
}


function seedBlogPostData() {
	console.info('seeding fake info');
	const seedData = [];
	for (i=1; i<10; i++) {
		seedData.push({
			author: {
				firstName: faker.name.firstName(),
				lastName: faker.name.lastName()
			},
			content: faker.lorem.text(),
			title: faker.lorem.sentence()
		});
	}

	return BlogPost.insertMany(seedData);
}



describe('blog post API resource', function() {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedBlogPostData();
	});

	afterEach(function() {
		return tearDown();
	});

	after(function() {
		return closeServer();
	});
});


describe('GET endpoint', function() {
	it('should retrieve all posts', function(){
		let res;
		return chai.request(app)
			.get('/posts')
			.then(_res => {
				res = _res;
				res.should.have.status(200);
				res.body.should.have.length.of.at.least(1);
				return BlogPost.count();
			})
			.then(count => {
				res.body.should.have.length.of(count);
			});
	});
	it('should return posts with expected keys', function() {
		let resPost;
		return chai.request(app)
			.get('/posts')
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');
				res.body.should.have.length.of.at.least(1);

				res.body.forEach(function(post) {
					post.should.be.a('object');
					post.should.include.keys('id', 'title', 'content', 'author', 'created');
				});

				resPost = res.body[0];
				return BlogPost.findById(resPost.id);
			})
			.then(post => {
				resPost.title.should.equal(post.title);
				resPost.content.should.equal(post.content);
				resPost.author.should.equal(post.author);
			});
	});
});


describe('POST endpoint', function() {
	it('should add a new post', function() {
		const newPost = {
			title: faker.lorem.sentence(),
			author: {
				firstName: faker.name.firstName(),
				lastName: faker.name.lastName()
			},
			content: faker.lorem.text()
		};

		return chai.request(app)
			.post('/posts')
			.send(newPost)
			.then(function(){
				res.should.be.json;
				res.should.have.status(201);
				res.should.be.a('object');
				res.body.should.include.keys(
					'id', 'title', 'author', 'content', 'created');
				res.body.title.should.equal(newPost.title);
				res.body.author.should.equal(
					`${newPost.author.firstName} ${newPost.author.lastName}`);
				res.body.content.should.equal(newPost.content);
				return BlogPost.findById(res.body.id);
			})
			.then(function(post) {
				post.title.should.equal(newPost.title);
				post.content.should.equal(newPost.content);
				post.author.firstName.should.equal(newPost.author.firstName);
				post.author.lastName.should.equal(newPost.author.lastName);
			});
	});
});


describe('POST endpoint', function() {
	it('should update post correctly', function() {
		const updateData = {
			title: 'updated title',
			content: 'updated content here',
			author: {
				firstName: 'up',
				lastName: 'dated'
			}
		};

		return BlogPost
			.findOne()
			.then(post => {
				updateData.id = post.id;

				return chai.request(app)
					.put('/posts/${post.id}')
					.send(updateData)
			})
			.then(res => {
				res.should.have.status(204);
				return BlogPost.findById(updateData.id);
			})
			.then(post => {
				post.title.should.equal(updateData.title);
				post.content.should.equal(updateData.content);
			});
	});
});


describe('DELETE endpoint', function() {
	it('should remove post by ID', function() {
		let post;

		return BlogPost
			.findOne()
			.then(post => {
				post = _post;
				return chai.request(app).delete(`/posts/${post.id}`);
			})
			.then(res => {
				res.should.have.status(204);
				return BlogPost.findById(post.id);
			})
			.then(_post => {
				should.not.exist(_post);
			});
	});
});