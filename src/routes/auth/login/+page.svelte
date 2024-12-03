<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card/index';
    import { enhance } from '$app/forms';

    let email = '';
    let password = '';
    let isSignUp = false;
</script>

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
        <form method="POST" use:enhance class="space-y-4">
            <input
                type="email"
                name="email"
                bind:value={email}
                placeholder="Email"
                class="w-full rounded border p-2"
                required
            />
            <input
                type="password"
                name="password"
                bind:value={password}
                placeholder="Password"
                class="w-full rounded border p-2"
                required
            />
            <input type="hidden" name="isSignUp" value={isSignUp} />
            <Button type="submit" class="w-full">
                {isSignUp ? 'Sign Up' : 'Login'}
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
