import { error, json, Router, html } from 'itty-router';
import Mustache from 'mustache';

import indexHtml from './public/index.html';
import notFoundHtml from './public/404.html';
import maintenanceHtml from './public/maintenance.html';
import preppingHtml from './public/prepping.html';
import resultHtml from './public/result.html';

const router = Router();

const maintenance = false;
const prepping = false;

const generateShortId = (id) => {
	const programCode = id.substring(4, 9);
	const studentNumberPrefix = id.substring(9, 11);
	const shortId = btoa(`${programCode}${studentNumberPrefix}`);
	return shortId.toLowerCase().substring(0, 6);
};

router
	.get('/api/list', async (request, env) => {
		const list = await env.DB.list();
		return json(list);
	})
	.get('/api/result/:id/:dob', async (request, env) => {
		const id = request.params.id;
		const dob = request.params.dob;

		if (!id || !dob) {
			return error(404, { msg: 'ID or DOB cannot be missing!' });
		}
		const startTime = performance.now();

		const value = await env.DB.get(id);
		const duration = ((performance.now() - startTime) / 1000).toFixed(2);

		if (value === null) {
			return error(404, { msg: 'Result not found! Recheck your ID and Date of Birth.' });
		}

		const result = JSON.parse(value);
		if (result.dob != dob) {
			return error(400, { msg: "DOB doesn't match with provided ID's credential." });
		}

		result.duration = duration;

		return json(result);
	})
	.get('/share/:sid', async (request, env) => {
		const shareId = request.params.sid;
		const value = await env.SHARE_DB.get(shareId);

		if (value === null) {
			return html(notFoundHtml);
		}

		const result = JSON.parse(value);
		result.seoImage = `https://placehold.co/800x400/007a50/white?text=${encodeURIComponent(result.name + '`s Academic Result')}`;

		const res = Mustache.render(resultHtml, result);
		return html(res);
	})
	.post('/api/share', async (request, env) => {
		const body = await request.json();

		if (!body.id || !body.dob) {
			return error(404, { msg: 'ID or DOB cannot be missing!' });
		}

		const value = await env.DB.get(body.id);

		if (value === null) {
			return error(404, { msg: 'Result not found! Recheck your ID and Date of Birth.' });
		}

		const result = JSON.parse(value);
		if (result.dob != body.dob) {
			return error(400, { msg: "DOB doesn't match with provided ID's credential." });
		}

		const shareId = generateShortId(body.id);
		const payload = {
			name: result.name,
			semester: result.semester,
			cgpa: result.cgpa,
			courses: result.courses,
			shareId: shareId,
		};

		await env.SHARE_DB.put(shareId, JSON.stringify(payload));
		return json(payload);
	})
	.get('/', () => (maintenance ? html(maintenanceHtml) : prepping ? html(preppingHtml) : html(indexHtml)))
	// 404 for everything else
	.all('*', (req) => html(notFoundHtml));

export default {
	fetch: (request, ...args) =>
		router
			.handle(request, ...args)
			.then(html)
			.catch(error),
};
