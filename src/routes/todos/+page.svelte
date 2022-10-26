<script lang="ts">
	import { enhance } from '$lib/form';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { PageData } from './$types';
	import { line, curveStep, scaleLinear, timeParse, extent, scaleTime } from 'd3';
	import { onMount } from 'svelte';

	export let data: PageData;
	let el;
	let width = 1200;
	const height = 500;
	const margin = { top: 20, bottom: 20, left: 20, right: 20 };
	let path = line()
		.x((d) => xScale(d.date))
		.y((d) => yScale(d.pong))
		.curve(curveStep);
	let xLabel = (x) => {
		return x.toISOString().substr(11, 5);
	};
	let linedata, xScale, yScale, xTicks, yTicks, yPath, xPath;
	const makeLineData = (inputData) => {
		let locallinedata = [];
		inputData.forEach((d) => {
			let pong;
			if (d.doc.pong.includes('Request timeout')) {
				pong = 0;
			} else if (Number(d.doc.pong.replace(/.*time=(.*) ms$/, '$1')) > 1000) {
				pong = 1000;
			} else {
				pong = Number(d.doc.pong.replace(/.*time=(.*) ms$/, '$1'));
			}
			locallinedata.push({
				date: new Date(d.doc._id * 1000),
				pong: pong
			});
		});
		let extentX = extent(locallinedata, (d) => d.date);
		xScale = scaleTime()
			.domain(extentX)
			.range([margin.left, width - margin.right]);

		let extentY = extent(locallinedata, (d) => d.pong);
		yScale = scaleLinear()
			.domain(extentY)
			.range([height - margin.bottom, margin.top]);

		xTicks = [];
		locallinedata.forEach((d) => {
			if (d.date.getSeconds() == 0) {
				xTicks.push(d.date);
			}
		});
		yTicks = [];
		for (let i = Math.round(extentY[0]); i < Math.round(extentY[1] + 1); i = i + 20) {
			yTicks.push(Math.floor(i / 20) * 20);
		}
		xPath = `M${margin.left + 0.5},6V0H${width - margin.right + 1}V6`;
		yPath = `M-6,${height + 0.5}H0.5V0.5H-6`;
		linedata = locallinedata;
		xScale = xScale;
		yScale = yScale;
		xTicks = xTicks;
		yTicks = yTicks;
		yPath = yPath;
		xPath = xPath;
	};

	makeLineData(data.todos);
	onMount(async () => {
		async function fetchData() {
			fetch('/api/todos', {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					accept: 'application/json'
				}
			})
				.then((res) => res.json())
				.then((res) => {
					data.todos = res;
					makeLineData(res);
				});
		}

		const interval = setInterval(fetchData, 3000);
		fetchData();
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Todos</title>
	<meta name="description" content="A todo list app" />
</svelte:head>

<div bind:clientWidth={width} class="todos">
	<h1>Todos</h1>
	<svg bind:this={el} transform="translate({margin.left}, {margin.top})" width="100%" {height}>
		<g>
			<path d={path(linedata)} fill="none" stroke="blue" />
		</g>

		<!-- y axis -->
		<g transform="translate({margin.left}, 0)">
			<path stroke="currentColor" d={yPath} fill="none" />

			{#each yTicks as y}
				<g class="tick" opacity="1" transform="translate(0,{yScale(y)})">
					<line stroke="currentColor" x2="-5" />
					<text dy="0.32em" fill="currentColor" x="-{margin.left}">
						{y}
					</text>
				</g>
			{/each}
		</g>

		<!-- x axis -->
		<g transform="translate(0, {height})">
			<path stroke="currentColor" d={xPath} fill="none" />

			{#each xTicks as x}
				<g class="tick" opacity="1" transform="translate({xScale(x)},0)">
					<line stroke="currentColor" y2="6" />
					<text fill="currentColor" y="9" dy="0.71em" x="-{margin.left}">
						{xLabel(x)}
					</text>
				</g>
			{/each}
		</g>
	</svg>

	{#each data.todos as todo (todo.id)}
		<div class="todo" transition:scale|local={{ start: 0.7 }} animate:flip={{ duration: 200 }}>
			<table>
				<tr>
					<td>Date</td>
					<td>{new Date(todo.doc._id * 1000).toISOString().replace('T', ' ')}</td>
				</tr>
				<tr>
					<td>SSID</td>
					<td>{todo.doc.ssid}</td>
				</tr>
				<tr>
					<td>Response</td>
					<td>{todo.doc.pong}</td>
				</tr>
			</table>
		</div>
	{/each}
</div>

<style>
	.todos {
		width: 100%;
		line-height: 1;
	}
	svg {
		margin-bottom: 60px;
		overflow: visible;
	}

	.new {
		margin: 0 0 0.5rem 0;
	}

	input {
		border: 1px solid transparent;
	}

	input:focus-visible {
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #ff3e00 !important;
		outline: none;
	}

	.new input {
		font-size: 28px;
		width: 100%;
		padding: 0.5em 1em 0.3em 1em;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		text-align: center;
	}

	.todo {
		grid-gap: 0.5rem;
		align-items: center;
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
		transition: filter 0.2s, transform 0.2s;
	}

	.done {
		transform: none;
		opacity: 0.4;
		filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.1));
	}

	form.text {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
	}

	.todo input {
		flex: 1;
		padding: 0.5em 2em 0.5em 0.8em;
		border-radius: 3px;
	}

	.todo button {
		width: 2em;
		height: 2em;
		border: none;
		background-color: transparent;
		background-position: 50% 50%;
		background-repeat: no-repeat;
	}

	button.toggle {
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 50%;
		box-sizing: border-box;
		background-size: 1em auto;
	}

	.done .toggle {
		background-image: url("data:image/svg+xml,%3Csvg width='22' height='16' viewBox='0 0 22 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 1.5L7.4375 14.5L1.5 8.5909' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
	}

	.delete {
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5 5V22H19.5V5H4.5Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M10 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 5H22' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 5L9.6445 2H14.3885L16 5H8Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
		opacity: 0.2;
	}

	.delete:hover,
	.delete:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}

	.save {
		position: absolute;
		right: 0;
		opacity: 0;
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 2H3.5C2.67158 2 2 2.67157 2 3.5V20.5C2 21.3284 2.67158 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V3.5C22 2.67157 21.3284 2 20.5 2Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M17 2V11H7.5V2H17Z' fill='white' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M13.5 5.5V7.5' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M5.99844 2H18.4992' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E%0A");
	}

	.todo input:focus + .save,
	.save:focus {
		transition: opacity 0.2s;
		opacity: 1;
	}
</style>
