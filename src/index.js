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
		const result = {};
		const startTime = performance.now();

		const duration = ((performance.now() - startTime) / 1000).toFixed(2);
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
