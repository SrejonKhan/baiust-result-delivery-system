import {
	error, // creates error responses
	json, // creates JSON responses
	Router, // the ~440 byte router itself
	withParams, // middleware: puts params directly on the Request
	html,
} from 'itty-router';

import indexHtml from './public/index.html';
import notFoundHtml from './public/404.html';
import maintenanceHtml from './public/maintenance.html';
import preppingHtml from './public/prepping.html';

// create a new Router
const router = Router();

const result = {
	id: '0822210105101022',
	name: 'Srejon',
	semester: 'FALL 2023',
	cgpa: '3.42',
	courses: [
		{
			course_code: 'CSE-211',
			course_title: 'Data Structures',
			credit: '3.00',
			grade: 'A+',
			status: 'PASSED',
		},
		{
			course_code: 'MATH-211',
			course_title: 'Math III',
			credit: '3.00',
			grade: 'F',
			status: 'FAILED',
		},
		{
			course_code: 'CSE-212',
			course_title: 'Object Oriented Programming Language',
			credit: '3.00',
			grade: 'A',
			status: 'PASSED',
		},
		{
			course_code: 'CSE-213',
			course_title: 'Data Structures Sessional',
			credit: '1.50',
			grade: 'B',
			status: 'PASSED',
		},
	],
};

const maintenance = false;
const prepping = false;

router
	// add some middleware upstream on all routes
	.all('*', withParams)

	.get('/api/result/:id/:dob', ({ id, dob }) => {
		// return error(404, req);
		const startTime = performance.now();
		result.id = id;
		result.dob = dob;

		const duration = ((performance.now() - startTime) / 1000).toFixed(2);
		result.duration = duration;

		return json(result);
	})
	.get('/share/:sid', ({ sid }) => html(sid))

	.get('/', () => (maintenance ? html(maintenanceHtml) : prepping ? html(preppingHtml) : html(indexHtml)))
	// 404 for everything else
	.all('*', (req) => html(notFoundHtml));

// Example: Cloudflare Worker module syntax
export default {
	fetch: (request, ...args) =>
		router
			.handle(request, ...args)
			.then(html) // send as JSON
			.catch(error), // catch errors
};
