<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type Monaco from 'monaco-editor';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { onDestroy, onMount } from 'svelte';

	let ref: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor;
	export let value: string;
	export let monaco: any;
	export let options: Monaco.editor.IStandaloneEditorConstructionOptions;

	const dispatch = createEventDispatcher();

	$: {
		if (editor) {
			const model = editor.getModel();
			if (model) {
				// pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
				// @ts-expect-error
				model.pushEditOperations(
					[],
					[
						{
							range: model.getFullModelRange(),
							text: value
						}
					]
				);
			}
		}
	}

	$: {
		if (monaco) {
			editor = monaco.editor.create(ref, options);
		}
	}

	$: {
		if (editor) {
			editor.onDidChangeModelContent((e) => {
				dispatch('change', editor.getValue());
			});
		}
	}

	onMount(() => {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};
	});

	onDestroy(() => {
		if (editor) {
			editor.dispose();
		}
	});
</script>

<div class="editor" bind:this={ref} />

<style>
	.editor {
		height: 100%;
		width: 100%;
	}
</style>
