<script lang="ts">
    export let value: number = 0;
</script>

<div class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
    <div
        class="h-full bg-primary transition-all duration-300"
        style:width="{Math.min(100, Math.max(0, value))}%"
    />
</div>