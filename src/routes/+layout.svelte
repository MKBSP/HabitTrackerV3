<script lang="ts">
    import '../app.postcss'
    import { invalidate } from '$app/navigation'
    import Navbar from '$lib/components/Navbar.svelte'
    import Footer from '$lib/components/Footer.svelte'
    import { onMount } from 'svelte'
    import { session } from '$lib/stores/auth'
    import { page } from '$app/stores'
    import { supabase } from '$lib/supabase'  // Import the supabase client

    let currentSession = $page.data.session

    onMount(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, _session) => {
                if (_session?.expires_at !== currentSession?.expires_at) {
                    invalidate('supabase:auth')
                }
            }
        )

        return () => subscription.unsubscribe()
    })

    $: if ($page.data.session) {
        currentSession = $page.data.session
        session.set($page.data.session)
    }
</script>

<div class="flex flex-col min-h-screen">
    <Navbar />
    <main class="flex-grow">
        <slot />
    </main>
    <Footer />
</div>