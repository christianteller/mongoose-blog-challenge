const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

function fillerText() {
	return 'heres a lot of text, its so much text. ' +
		'its crazy how much text is here like no joke ' +
		'even more text here as well, i know you are ' +
		'impressed with this text.'
}

BlogPosts.create(
	'10 things -- about stuff and things', fillerText(), 'Author Person');
BlogPosts.create(
	'4 things -- theres things to in this post', fillerText(), 'Another Person');

router.get('/', (req, res) => {
	res.json(BlogPosts.get());
});


router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for(let i=0;i<requiredFields;i++){
		const field = requiredFields[i];
		if (!(field in req.body)){
			const message = 'Missing \`${field}\` in request'
			console.error(message);
			return res.status(400).send(message);
		}
	}
});

router.put('/:id', jsonParser, (req, res) => {
	const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
	for(let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = 'missing \`${field}\` in request'
			console.error(message);
			return res.status(400).send(message);
		}
	}
	if (req.params.id !== req.body.id) {
		const message = 'request id \`${req.params.id}\` and body id \`${req.body.id}\` must match';
		console.error(message);
		return res.status(400).send(message);
	}
	console.log(`updating blog post with id \`${req.params.id}\``);
	const updatedItem = BlogPosts.update({
		id: req.params.id,
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
		publishDate: req.body.publishDate
	});
	res.status(204).end();
});


router.delete('/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log('Deleted blog post with id \`${req.params.ID}\`');
	res.status(204).end();
});

module.exports = router;