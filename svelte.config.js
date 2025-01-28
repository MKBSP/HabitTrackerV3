import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		typescript: {
			tsconfigFile: './tsconfig.json'
		}
	}),
	kit: {
		adapter: adapter({
			runtime: 'nodejs18.x'
		})
	}
};

export default config;
