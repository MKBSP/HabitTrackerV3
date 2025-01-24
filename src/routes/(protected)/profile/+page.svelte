<!-- This file creates the profile page user interface -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import Input from '$lib/components/ui/input/input.svelte';
    import Label from '$lib/components/ui/label/label.svelte';
    import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    
    // Get the profile data passed from server
    export let data;
    let { profile } = data;
    
    let deleteConfirmation = '';

    let editing = {
        userName: false,
        location: false,
        description: false
    };
    
    let formData = {
        userName: profile?.user_name ?? '',
        location: profile?.location ?? '',
        description: profile?.description ?? ''
    };

    async function handleSave(field: keyof typeof editing) {
        const formDataObj = new FormData();
        formDataObj.set(field, formData[field]);
        
        const res = await fetch('?/updateProfile', {
            method: 'POST',
            body: formDataObj
        });
        
        if (res.ok) {
            editing[field] = false;
            profile[field === 'userName' ? 'user_name' : field] = formData[field];
        }
    }
</script>

<div class="container mx-auto py-8 max-w-3xl">
    <Tabs value="profile" class="space-y-6">
        <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <Card.Root class="border-2 border-border">
                <Card.Header class="space-y-1">
                    <Card.Title class="text-2xl font-semibold">Profile Settings</Card.Title>
                    <Card.Description>Manage your personal information</Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="space-y-6">
                        <!-- Field Groups with consistent styling -->
                        {#each ['userName', 'location', 'description'] as field}
                            <div class="space-y-2">
                                <Label class="text-sm font-medium">
                                    {field === 'userName' ? 'Username' : 
                                     field === 'location' ? 'Location' : 'About'}
                                </Label>
                                <div class="flex items-center gap-3">
                                    {#if editing[field]}
                                        {#if field === 'description'}
                                            <Textarea
                                                bind:value={formData[field]}
                                                placeholder={`Enter your ${field}`}
                                                rows="4"
                                                class="flex-1"
                                            />
                                        {:else}
                                            <Input 
                                                bind:value={formData[field]}
                                                placeholder={`Enter your ${field}`}
                                                class="flex-1"
                                            />
                                        {/if}
                                        <Button 
                                            size="sm"
                                            class="shrink-0"
                                            on:click={() => handleSave(field)}
                                        >
                                            Save
                                        </Button>
                                    {:else}
                                        <p class="flex-1 py-2 px-3 bg-muted rounded-md min-h-[2.5rem] flex items-center">
                                            {profile[field === 'userName' ? 'user_name' : field] || `No ${field} set`}
                                        </p>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            class="shrink-0"
                                            on:click={() => editing[field] = true}
                                        >
                                            Edit
                                        </Button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </Card.Content>
            </Card.Root>
        </TabsContent>

        <TabsContent value="security">
            <div class="space-y-6">
                <!-- Email Section -->
                <Card.Root class="border-2 border-border">
                    <Card.Header class="space-y-1">
                        <Card.Title class="text-2xl font-semibold">Email Settings</Card.Title>
                        <Card.Description>Update your email address</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <form method="POST" action="?/updateEmail" use:enhance class="space-y-4">
                            <div class="space-y-2">
                                <Label class="text-sm font-medium">Email Address</Label>
                                <Input 
                                    name="email"
                                    type="email"
                                    value={profile?.email ?? ''}
                                />
                            </div>
                            <Button type="submit" class="w-full">Update Email</Button>
                        </form>
                    </Card.Content>
                </Card.Root>

                <!-- Password Section -->
                <Card.Root class="border-2 border-border">
                    <Card.Header class="space-y-1">
                        <Card.Title class="text-2xl font-semibold">Password Settings</Card.Title>
                        <Card.Description>Change your password</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <form method="POST" action="?/updatePassword" use:enhance class="space-y-4">
                            {#each ['currentPassword', 'newPassword', 'confirmPassword'] as field}
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium">
                                        {field === 'currentPassword' ? 'Current Password' :
                                         field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                                    </Label>
                                    <Input 
                                        name={field}
                                        type="password"
                                        required
                                    />
                                </div>
                            {/each}
                            <Button type="submit" class="w-full">Update Password</Button>
                        </form>
                    </Card.Content>
                </Card.Root>
            </div>
        </TabsContent>

        <TabsContent value="danger">
            <Card.Root class="border-2 border-destructive/50">
                <Card.Header class="space-y-1">
                    <Card.Title class="text-2xl font-semibold text-destructive">Delete Account</Card.Title>
                    <Card.Description>
                        Once your account is deactivated, all your data will become inaccessible.
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    <form method="POST" action="?/deleteProfile" use:enhance class="space-y-4">
                        <div class="space-y-2">
                            <Label class="text-sm font-medium">Confirmation</Label>
                            <div class="space-y-1">
                                <Input 
                                    name="deleteConfirmation"
                                    bind:value={deleteConfirmation}
                                    placeholder='Type "delete me" to confirm'
                                    required
                                />
                                <p class="text-xs text-muted-foreground">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            variant="destructive"
                            class="w-full"
                            disabled={deleteConfirmation !== 'delete me'}
                        >
                            Deactivate Account
                        </Button>
                    </form>
                </Card.Content>
            </Card.Root>
        </TabsContent>
    </Tabs>
</div>