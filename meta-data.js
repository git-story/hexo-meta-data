/*
 * meta-data.js
 * Created on Tue Aug 04 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const MHexo = require('hexo');
const mhexo = new MHexo(process.cwd(), {});

const db = [];

const dateSort = (a, b) => {
	const ad = new Date(a.date);
	const bd = new Date(b.date);

	return bd.getTime() - ad.getTime();
};

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
			if ( content.length > MAX_CONTENT_LENGTH ) {
				content = content.substr(0, MAX_CONTENT_LENGTH) + ' ...';
			}

			db.push({
				title: post.title,
				href: post.path,
				date,
				updated,
				src: path.join(sourceDir, post.source),
				categories: post.categories.data.map(c => c.name),
				tags: post.tags.data.map(t => t.name),
				cover: post.cover,
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

