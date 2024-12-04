<script lang="ts">
	import '../app.postcss';
	import { goto, invalidate } from '$app/navigation';
	import { ModeWatcher } from 'mode-watcher';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { Button } from '$lib/components/ui/button';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const { data: propsData, children } = $props();

	const { supabase, session } = propsData;

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (!newSession) {
				/**
				 * Queue this as a task so the navigation won't prevent the
				 * triggering function from completing
				 */
				setTimeout(() => {
					goto('/', { invalidateAll: true });
				});
			}
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<Navbar />
{@render children()}
<Footer />
