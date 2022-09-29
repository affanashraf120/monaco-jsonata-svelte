<script>
	import JsonAtaExerciser from '../components/JsonAtaExerciser/index.svelte';
	import sample from '../sample';

	let result = '';
	let data = sample.json;
	let query = sample.query;
</script>

<main>
	<JsonAtaExerciser bind:data bind:query bind:result />
</main>
