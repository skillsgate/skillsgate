-- CreateIndex
CREATE INDEX idx_skills_github_stars ON skills (github_stars DESC NULLS LAST);
