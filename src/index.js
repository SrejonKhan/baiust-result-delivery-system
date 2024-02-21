import { error, json, Router, html } from 'itty-router';

import indexHtml from './public/index.html';
import notFoundHtml from './public/404.html';
import maintenanceHtml from './public/maintenance.html';
import preppingHtml from './public/prepping.html';

const router = Router();

const maintenance = false;
const prepping = false;

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
	.get('/share/:sid', ({ sid }) => html(sid))

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
