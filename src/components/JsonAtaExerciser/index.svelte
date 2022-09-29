<script lang="ts">
	import { onMount } from 'svelte';
	import type { editor } from 'monaco-editor';
	import Editor from './Editor.svelte';
	import jsonata from 'jsonata';
	import JsonAtaEditor from './JsonAtaEditor.svelte';
	import ResultEditor from './ResultEditor.svelte';

	export let data: any;

	export let query = '';

	export let result = '';

	let monaco: any;

	let common: editor.IStandaloneEditorConstructionOptions = {
		minimap: {
			enabled: false
		},
		lineNumbers: 'off',
		smoothScrolling: true,
		cursorSmoothCaretAnimation: true,
		theme: 'jsonataTheme'
	};

	const handleJSON = (e: { detail: any }) => {
		try {
			data = JSON.parse(e.detail);
			const expression = jsonata(query);
			result = JSON.stringify(expression.evaluate(data),null,'\t');
		} catch (error: any) {
			result = error?.message || 'Error';
		}
	};

	const handleQuery = (e: { detail: any }) => {
		try {
			query = e.detail;
			const expression = jsonata(query);
			result = JSON.stringify(expression.evaluate(data),null,'\t');
		} catch (error: any) {
			result = error?.message || 'Error';
		}
	};

	onMount(async () => {
		monaco = await import('monaco-editor');
		const expression = jsonata(query);
		setTimeout(() => {
			result = JSON.stringify(expression.evaluate(data), null, '\t');
		}, 1000);
	});
</script>

<div class="x-split border">
	<div class="half">
		<Editor
			bind:monaco
			value={JSON.stringify(data, null, 2)}
			on:change={handleJSON}
			options={{
				language: 'json',
				extraEditorClassName: 'editor-pane',
				...common
			}}
		/>
	</div>

	<div class="border" />

	<div class="y-split">
		<div class="quarter">
			<JsonAtaEditor
				bind:monaco
				bind:value={query}
				on:change={handleQuery}
				options={{
					language: 'jsonata',
					extraEditorClassName: 'editor-pane',
					...common
				}}
			/>
		</div>
		<div class="border" />
		<div class="quarter">
			<ResultEditor
				bind:monaco
				bind:value={result}
				options={{
					language: 'json',
					extraEditorClassName: 'result-pane',
					scrollBeyondLastLine: false,
					...common
				}}
			/>
		</div>
		<div class="border" />
	</div>
</div>

<style>
	.half {
		height: 80vh;
		width: 40vw;
	}

	.quarter {
		height: 40vh;
		width: 40vw;
	}

	.x-split {
		display: flex;
	}

	.y-split {
		display: flex;
		flex-direction: column;
	}

	.border {
		border: 1px solid black;
	}
</style>
