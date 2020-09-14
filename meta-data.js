#!/usr/bin/env node
/*
 * meta-data.js
 * Created on Tue Aug 04 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

const path = require('path');
const fs = require('fs');

const Hexo = require('hexo');
const hexo = new Hexo(process.cwd(), {});

const db = [];

(async () => {
	await hexo.init();
	await hexo.load();

	const sourceDir = hexo.config.source_dir;
	const query = hexo.locals.get('posts');
	for ( let i=0; i < query.length;i++ ) {
		const post = query.data[i];
		const utc = post.updated.utc().format();

		db.push({
			title: post.title,
			href: post.path,
			updated: utc,
			src: path.join(sourceDir, post.path),
			categories: post.categories.data,
			tags: post.tags.data,
		});
	}

	fs.writeFileSync(
		path.join(__dirname, 'meta-data.json'),
		JSON.stringify(db, null, '\t'),
		{ encoding: 'utf8' }
	);
})();
