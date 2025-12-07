export const THEMES = [
	'theme-bepop',
	'theme-blade',
	'theme-tron',
	'theme-neuromancer',
	'theme-akira'
];

export let themeState = $state({
	value: getThemeLS() || THEMES[0]
});

export const switchTheme = () => {
	let themeIdx = THEMES.indexOf(themeState.value);
	if (themeIdx === -1) themeIdx = 0;

	const nextThemeIdx = (themeIdx + 1) % THEMES.length;
	themeState.value = THEMES[nextThemeIdx];
	setThemeLS(themeState.value);
};

function getThemeLS() {
	return localStorage.getItem('theme');
}

function setThemeLS(theme: string) {
	localStorage.setItem('theme', theme);
}
