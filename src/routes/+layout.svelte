<script lang="ts">
    import '../app.postcss';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/Navbar.svelte';

    onMount(() => {
        const { supabase } = $page.data;
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                window.location.href = '/';
            }
        });
    });
</script>

<Navbar />
<slot />
