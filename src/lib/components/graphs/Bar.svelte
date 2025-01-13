<script>
    import { getContext } from 'svelte';
    
    const { data, xGet, yGet, width } = getContext('LayerCake');
    
    $: barWidth = $width / $data.length;
</script>

<g class="bars">
    {#each $data as d, i}
        <rect
            x={$xGet(d)}
            y={$yGet(d)}
            width={barWidth}
            height={$yGet.range()[0] - $yGet(d)}
            fill="hsl(var(--primary))"
            opacity="0.8"
        >
            <title>{d.name}: {d.value} completion{d.value !== 1 ? 's' : ''}</title>
        </rect>
    {/each}
</g>