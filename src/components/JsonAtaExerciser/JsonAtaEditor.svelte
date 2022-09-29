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

	const brackets = [
		{ open: '(', close: ')' },
		{ open: '[', close: ']' },
		{ open: '{', close: '}' },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" },
		{ open: '`', close: '`' }
	];

	const dispatch = createEventDispatcher();

	$: {
		if (editor) {
			const model = editor.getModel();
			const selection = editor.getSelection();
			if (model && selection) {
				
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
				// editor.getAction('editor.action.formatDocument').run();
			}
		}
	}

	$: {
		if (monaco) {
			monaco.languages.register({ id: 'jsonata' });
			monaco.languages.setMonarchTokensProvider('jsonata', {
				tokenizer: {
					root: [
						[/\/\*.*\*\//, 'jsonata-comment'],
						[/'.*'/, 'jsonata-string'],
						[/".*"/, 'jsonata-string'],
						[/\$[a-zA-Z0-9_]*/, 'jsonata-variable'],
						[/[a-zA-Z0-9_]+/, 'jsonata-names']
					]
				}
			});
			monaco.languages.setLanguageConfiguration('jsonata', {
				brackets: [
					['(', ')'],
					['[', ']'],
					['{', '}']
				],
				autoClosingPairs: brackets,
				surroundingPairs: brackets,
				indentationRules: {
					// ^(.*\*/)?\s*\}.*$
					decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[}\])].*$/,
					// ^.*\{[^}"']*$
					increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/
				},
				insertSpaces: true,
				tabSize: 2
			});
			// Define a new theme that contains only rules that match this language
			monaco.editor.defineTheme('jsonataTheme', {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: 'jsonata-string', foreground: 'a00000' },
					{ token: 'jsonata-comment', foreground: '008000' },
					{ token: 'jsonata-variable', foreground: 'ff4000' },
					{ token: 'jsonata-names', foreground: '0000c0' }
				],
				colors: {
					'editor.background': '#fffffb'
				}
			});
			//
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
			const model = editor.getModel();
			if (model) {
				model.dispose();
			}
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
