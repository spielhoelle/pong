import { error } from '@sveltejs/kit';
import { api } from './api';
import type { PageServerLoad, Action } from './$types';

type Todo = {
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
import Nano from 'nano';
const n = Nano('http://admin:password@127.0.0.1:5984')
const db = n.db.use('pong')
export const load: PageServerLoad = async ({ locals }) => {
	// locals.userid comes from src/hooks.js
	// const response = await api('GET', `todos/${locals.userid}`);
	const docs = await db.list({
		include_docs: true,
		// descending: true,
		// skip: 0,
		limit: 500,
	})
	if (docs.rows.length === 0) {
		// user hasn't created a todo list.
		// start with an empty array
		return {
			todos: [] as Todo[]
		};
	}

	if (docs.rows.length > 0) {
		return {
			todos: docs.rows as Todo[]
		};
	}

	throw error(500);
};

export const POST: Action = async ({ request, locals }) => {
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
