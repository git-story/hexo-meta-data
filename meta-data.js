/*
 * meta-data.js
 * Created on Tue Aug 04 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

let config = {};
try {
	config = JSON.parse(fs.readFileSync('./.mdrc', 'utf8'));
} catch {
	config = {
		max_content_length: 50,
	};
}

const MHexo = require('hexo');
const mhexo = new MHexo(process.cwd(), {});

const db = [];

const dateSort = (a, b) => {
	const ad = new Date(a.date);
	const bd = new Date(b.date);

	return bd.getTime() - ad.getTime();
};

// https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url
function validateUrl(value) {
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}


const MAX_CONTENT_LENGTH = 50;
mhexo.init()
	.then(() => mhexo.load())
	.then(() => {
		const sourceDir = mhexo.config.source_dir;
		const query = mhexo.locals.get('posts');
		for ( let i=0; i < query.length;i++ ) {
			const post = query.data[i];
			const date = post.date.utc().format();
			const updated = post.updated.utc().format();

			const $ = cheerio.load(post.content);
			let content = $.text();
			content = content.replace(/\n/g, ' ');
			if ( config.max_content_length >= 0 && content.length > config.max_content_length ) {
				content = content.substr(0, config.max_content_length) + ' ...';
			}

			let cover = post.cover;
			if ( cover && !validateUrl(cover) ) {
				const url = mhexo.config.url;
				let suffix = '';
				if ( url[url.length-1] !== '/' && post.cover[0] !== '/' ) {
					suffix = '/';
				}

				cover = `${mhexo.config.url}${suffix}${cover}`;
			}

			db.push({
				title: post.title,
				href: post.path,
				date,
				updated,
				src: path.join(sourceDir, post.source),
				categories: post.categories.data.map(c => c.name),
				tags: post.tags.data.map(t => t.name),
				cover,
				content,
			});
		}

		fs.writeFileSync(
			path.join(process.cwd(), 'meta-data.json'),
			JSON.stringify(db.sort(dateSort), null, '\t'),
			{ encoding: 'utf8' }
		);
		mhexo.exit();
		process.exit(0);
	});

