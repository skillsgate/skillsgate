export type CatalogSkill = {
	skillId: string;
	slug: string;
	name: string;
	description: string;
	summary: string;
	categories: string[];
	capabilities: string[];
	keywords: string[];
	githubUrl: string;
	githubStars: number | null;
	installCommand: string | null;
	urlPath: string;
};

export type SearchResult = {
	skillId: string;
	slug: string;
	name: string;
	description: string;
	summary: string;
	categories: string[];
	capabilities: string[];
	keywords: string[];
	githubUrl: string;
	githubStars: number | null;
	installCommand: string | null;
	urlPath: string;
	score: number;
};
