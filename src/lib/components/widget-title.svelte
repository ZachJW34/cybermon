<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	export type WidgetTitleProps = { title: string; subtitle?: string; [key: string]: any };
	let { title, subtitle, ...restProps }: WidgetTitleProps = $props();
</script>

<div class={twMerge('flex items-center gap-1 border-b', restProps.class)}>
	<h3>{title}</h3>
	{#if subtitle}
		<span class="truncate border-l border-primary/50 pl-1 text-xs font-bold text-primary/50">
			{subtitle}
		</span>
	{/if}
</div>
