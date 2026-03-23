export function formatStars(stars: number): string {
	if (stars >= 1000) {
		return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`;
	}
	return String(stars);
}
