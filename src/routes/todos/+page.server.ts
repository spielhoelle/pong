import { api } from './api';
import type { PageServerLoad, Action } from './$types';

type Doc = {
	id: string,
	key: string,
	value: {
		rev: string
	},
	doc: {
		_id: string,
		_rev: string,
		ssid: string,
		pong: string
	}
};

import { GET } from '../api/todos/+server';

export const load: PageServerLoad = async ({ locals }) => {
	const resp = await GET()
	const rows: Doc[] = await resp.json()
	return { todos: rows }
};

export const POST: Action = async ({ request, locals }) => {
	console.log("POST")
	const form = await request.formData();

	await api('POST', `todos/${locals.userid}`, {
		text: form.get('text')
	});
};

export const PATCH: Action = async ({ request, locals }) => {
	const form = await request.formData();

	await api('PATCH', `todos/${locals.userid}/${form.get('uid')}`, {
		text: form.has('text') ? form.get('text') : undefined,
		done: form.has('done') ? !!form.get('done') : undefined
	});
};

export const DELETE: Action = async ({ request, locals }) => {
	const form = await request.formData();

	await api('DELETE', `todos/${locals.userid}/${form.get('uid')}`);
};
