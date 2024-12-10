<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import ThemeToggle from './ui/ThemeToggle.svelte';
    import { Button } from './ui/button';
    import { dev } from '$app/environment';
    import { goto } from '$app/navigation';

    let session = null;
    let user = null;

    onMount(async () => {
        const { supabase } = $page.data;
        // Get authenticated user data
        const { data: userData, error } = await supabase.auth.getUser();
        if (error && dev) console.error('Auth error:', error);
        user = userData?.user;
        session = $page.data.session;

        // Subscribe to auth changes
        const { subscription } = supabase.auth.onAuthStateChange(
            async (event, _session) => {
                if (dev) console.log('Auth event:', event, _session);
                if (event === 'SIGNED_IN') {
                    const { data: { user: newUser } } = await supabase.auth.getUser();
                    user = newUser;
                    session = _session;
                }
                if (event === 'SIGNED_OUT') {
                    user = null;
                    session = null;
                }
            }
        );

        return () => subscription.unsubscribe();
    });

    async function handleLogout() {
        const { supabase } = $page.data;
        await supabase.auth.signOut();
    }
</script>

<nav class="flex justify-between p-4 bg-background">
    <div class="flex gap-4 items-center">
        <Button variant="ghost" href="/dashboard" class="font-bold">
            LOGO
        </Button>
        
        {#if session}
            <Button variant="ghost" href="/dashboard">Dashboard</Button>
            <Button variant="ghost" href="/goals">Goals</Button>
        {/if}
    </div>

    <div class="flex gap-4 items-center">
        <ThemeToggle />
        
        {#if session}
            <Button variant="ghost" href="/profile">
                {#if user?.user_metadata?.avatar_url}
                    <img 
                        src={user.user_metadata.avatar_url}
                        alt="User" 
                        style="width: 24px; height: 24px; border-radius: 50%;"
                    />
                {:else}
                    <div style="width: 24px; height: 24px; border-radius: 50%; background-color: rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center;">
                        {user?.email?.[0]?.toUpperCase() ?? '?'}
                    </div>
                {/if}
            </Button>
            <Button on:click={handleLogout}>Logout</Button>
        {:else}
            <Button href="/login">Login</Button>
        {/if}
    </div>
</nav>