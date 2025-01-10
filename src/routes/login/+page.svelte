<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    export let form: ActionData;
    
    let isSignUp = false;
    let loading = false;
</script>

<div class="container mx-auto py-6">
    <Card.Root class="mx-auto max-w-md">
        <Card.Header>
            <Card.Title class="text-3xl font-thin">
                {isSignUp ? 'Sign Up' : 'Login'}
            </Card.Title>
            <Card.Description>
                {isSignUp ? 'Create a new account' : 'Choose a provider or use email'}
            </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
            <form 
                method="POST" 
                use:enhance={() => {
                    loading = true;
                    return async ({ result, update }) => {
                        loading = false;
                        await update();
                    };
                }}
                class="space-y-4"
            >
                {#if form?.error}
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {form.error}
                    </div>
                {/if}
                {#if form?.message}
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {form.message}
                    </div>
                {/if}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    class="w-full rounded border p-2"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    class="w-full rounded border p-2"
                    required
                />
                <input type="hidden" name="isSignUp" value={isSignUp} />
                <Button type="submit" class="w-full" disabled={loading}>
                    {#if loading}
                        Loading...
                    {:else}
                        {isSignUp ? 'Sign Up' : 'Login'}
                    {/if}
                </Button>
            </form>

            <div class="text-center">
                <button 
                    class="text-sm text-blue-500 hover:underline"
                    on:click={() => isSignUp = !isSignUp}>
                    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </button>
            </div>
        </Card.Content>
    </Card.Root>
</div>