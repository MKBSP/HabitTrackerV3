<script lang="ts">
    import { page } from '$app/stores';
    import { session, user } from '$lib/stores/auth';
    import { supabase } from '$lib/supabase';
    import { browser } from '$app/environment';
    import ThemeToggle from './ui/ThemeToggle.svelte';
    import { Button } from './ui/button';
    // Remove goto import since we're using window.location.href
    
    let error: string | null = null;

    async function handleLogout() {
        if (!browser) return;
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
            
            session.set(null);
            user.set(null);
            window.location.href = '/auth/login';
        } catch (e) {
            console.error('Logout error:', e);
            error = 'Failed to logout. Please try again.';
        }
    }
</script>

<nav class="flex justify-between p-4 bg-background">
    <div class="flex gap-4 items-center">
        <Button variant="ghost" href="/" class="font-bold">
            LOGO
        </Button>
        
        {#if $session}
            <Button variant="ghost" href="/dashboard">Dashboard</Button>
            <Button variant="ghost" href="/goals">Goals</Button>
        {/if}
    </div>

    <div class="flex gap-4 items-center">
        <ThemeToggle />
        {#if error}
            <span class="text-destructive text-sm">{error}</span>
        {/if}
        {#if $session}
            <Button variant="ghost" on:click={handleLogout}>Logout</Button>
        {:else}
            <Button variant="ghost" href="/auth/login">Login</Button>
        {/if}
    </div>
</nav>