import Nano from 'nano';
const n = Nano('http://admin:password@127.0.0.1:5984')
const db = n.db.use('pong')

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const docs = await db.list({
		include_docs: true,
		descending: true,
		// skip: 0,
		limit: 1200,
	})
	// TODO substract local timezone offset
	// const timezone = new Date().getTimezoneOffset();
	// console.log('timezone', timezone)

	// const rows = docs.rows.map(row => ({ ...row, doc: { ...row.doc, _id: Number(row.doc._id) + (timezone * 60 * 60) } }))
	// console.log('docs.rows', rows[0])
	return new Response(String(JSON.stringify(docs.rows)));
}
