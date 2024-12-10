<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Hero from '$lib/components/Hero.svelte';

    let { data } = $props();

    onMount(() => {
        if (data?.session) {
            goto('/dashboard');
        }
    });
</script>

<Hero />
