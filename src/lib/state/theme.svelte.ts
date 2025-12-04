const initalIdx = 0;
export const THEMES = [
	'theme-bepop',
	'theme-blade',
	'theme-tron',
	'theme-neuromancer',
	'theme-akira'
];
export let themeState = $state<{ idx: number; value: string }>({
	idx: initalIdx,
	value: THEMES[initalIdx]
});

export const switchTheme = () => {
	themeState.idx = (themeState.idx + 1) % THEMES.length;
	themeState.value = THEMES[themeState.idx];
};
