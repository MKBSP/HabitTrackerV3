<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import Hero from '$lib/components/Hero.svelte';

    $: if ($page.data?.session) {
        goto('/dashboard');
    }
</script>

<Hero />