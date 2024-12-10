<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import { page } from '$app/stores';

    $: user = $page.data.session?.user;
</script>

<div class="container mx-auto py-6">
    <Card.Root>
        <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>Manage your account settings</Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="space-y-4">
                <div class="flex items-center space-x-4">
                    {#if user?.user_metadata?.avatar_url}
                        <img 
                            src={user.user_metadata.avatar_url} 
                            alt="Profile" 
                            class="h-20 w-20 rounded-full"
                        />
                    {:else}
                        <div class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                            {user?.email?.[0]?.toUpperCase() ?? '?'}
                        </div>
                    {/if}
                    <div>
                        <h3 class="text-lg font-medium">{user?.email}</h3>
                        <p class="text-sm text-gray-500">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="pt-4 border-t">
                    <h4 class="font-medium mb-2">Account Settings</h4>
                    <div class="space-y-2">
                        <p>Email: {user?.email}</p>
                        <p>Last Sign In: {new Date(user?.last_sign_in_at || '').toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </Card.Content>
    </Card.Root>
</div>