<script lang="ts">
    import { page } from '$app/stores';
    import ThemeToggle from './ui/ThemeToggle.svelte';
    import { Button } from './ui/button';
    
    export let session: Session | null;
    
    async function handleLogout() {
        const { supabase } = $page.data;
        await supabase.auth.signOut();
    }
</script>

<nav style="display: flex; justify-content: space-between; padding: 1rem;">
    <div style="display: flex; gap: 1rem; align-items: center;">
        <span>LOGO</span>
        
        {#if session}
            <Button variant="ghost" href="/dashboard">Dashboard</Button>
            <Button variant="ghost" href="/goals">Goals</Button>
        {/if}
    </div>

    <div style="display: flex; gap: 1rem; align-items: center;">
        <ThemeToggle />
        
        {#if session}
            <Button variant="ghost">
                <img 
                    src="/placeholder-avatar.png" 
                    alt="User" 
                    style="width: 24px; height: 24px; border-radius: 50%;"
                />
            </Button>
            <Button on:click={handleLogout}>Logout</Button>
        {:else}
            <Button href="/login">Login</Button>
        {/if}
    </div>
</nav>