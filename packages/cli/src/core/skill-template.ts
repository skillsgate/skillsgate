import type { PublishSkillMetadata } from "../types.js";
import { validateName, getDirectorySkillName } from "./skill-validator.js";

export interface TemplateData {
  name: string;
  description: string;
  overview?: string;
  license?: string;
}

/**
 * Generate SKILL.md template content
 */
export function generateSkillMd(data: TemplateData): string {
  const overview = data.overview?.trim() || "Brief overview of what this skill does and when it should be used.";
  
  let template = `---
name: ${data.name}
description: ${data.description}`;

  if (data.license) {
    template += `\nlicense: ${data.license}`;
  }

  template += `
---

# ${data.name}

## Overview

${overview}

## Usage

Describe how to use this skill. When should it be invoked? What arguments does it accept?

## Instructions

Provide detailed step-by-step instructions for the agent:

1. Step one...
2. Step two...
3. Step three...

## Examples

### Example 1: Basic usage

\`\`\`
/${data.name} argument1 argument2
\`\`\`

Expected behavior...

## Notes

Any additional context, constraints, or important details...
`;

  return template;
}

/**
 * Get the default skill name from directory, validating it
 * Returns null if directory name is not a valid skill name
 */
export function getDefaultSkillName(dir: string): string | null {
  const result = getDirectorySkillName(dir);
  return result.valid ? result.name : null;
}

/**
 * Validate a skill name and return error message if invalid
 */
export function getSkillNameValidationError(name: string): string | null {
  const result = validateName(name);
  if (!result.valid && result.errors.length > 0) {
    return result.errors[0];
  }
  return null;
}
