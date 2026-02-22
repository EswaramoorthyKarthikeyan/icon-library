
/**
 * Naming validation rules for the Icon Library.
 * Enforces kebab-case and ensures no duplicates.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validates an icon name.
 * @param name The name to validate
 * @param existingNames Array of names already in the library
 * @returns ValidationResult
 */
export const validateIconName = (name: string, existingNames: string[] = []): ValidationResult => {
  // Check for empty name
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name cannot be empty' };
  }

  // Check for duplicates
  if (existingNames.some(existing => existing.toLowerCase() === name.toLowerCase())) {
    return { 
      isValid: false, 
      error: 'Name already exists in the library',
      suggestion: `${name}-copy`
    };
  }

  // Check for valid characters (kebab-case)
  // Allowed: lowercase letters, numbers, hyphens
  const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabRegex.test(name)) {
    // Generate suggestion
    const suggestion = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '');   // Trim leading/trailing hyphens

    return { 
      isValid: false, 
      error: 'Name must be in kebab-case (lowercase, alphanumeric, hyphens)',
      suggestion: suggestion
    };
  }

  return { isValid: true };
};
