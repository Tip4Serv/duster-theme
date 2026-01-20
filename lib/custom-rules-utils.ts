import type { CustomRule, CustomField } from './schemas';

export interface CustomRuleValidation {
  rule: CustomRule;
  total: number;
  isValid: boolean;
  min: number | null;
  max: number | null;
}

/**
 * Calculate the total value for a custom rule based on field values
 */
export function calculateRuleTotal(
  rule: CustomRule,
  customFields: Record<string, any>,
  customFieldsData?: CustomField[]
): number {
  let total = 0;

  for (const fieldId of rule.fields) {
    const value = customFields[fieldId.toString()];
    
    if (value !== undefined && value !== null && value !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        total += numValue;
      }
    }
  }

  return total;
}

/**
 * Validate all custom rules for a product
 */
export function validateCustomRules(
  rules: CustomRule[] | undefined,
  customFields: Record<string, any>,
  customFieldsData?: CustomField[]
): CustomRuleValidation[] {
  if (!rules || rules.length === 0) {
    return [];
  }

  return rules
    .sort((a, b) => a.order - b.order)
    .map((rule) => {
      const total = calculateRuleTotal(rule, customFields, customFieldsData);
      const minValid = rule.min === undefined || total >= rule.min;
      const maxValid = rule.max === undefined || total <= rule.max;
      const isValid = minValid && maxValid;

      return {
        rule,
        total,
        isValid,
        min: rule.min ?? null,
        max: rule.max ?? null,
      };
    });
}

/**
 * Check if all rules are valid
 */
export function areAllRulesValid(validations: CustomRuleValidation[]): boolean {
  return validations.every((v) => v.isValid);
}

/**
 * Get error message for invalid rules
 */
export function getCustomRulesErrorMessage(validations: CustomRuleValidation[]): string | null {
  const invalidRules = validations.filter((v) => !v.isValid);
  
  if (invalidRules.length === 0) {
    return null;
  }

  const messages = invalidRules.map((v) => {
    const { rule, total, min, max } = v;
    
    if (min !== null && max !== null) {
      return `${rule.name}: must be between ${min} and ${max} (currently ${total})`;
    } else if (min !== null) {
      return `${rule.name}: must be at least ${min} (currently ${total})`;
    } else if (max !== null) {
      return `${rule.name}: must be at most ${max} (currently ${total})`;
    }
    
    return `${rule.name}: invalid value`;
  });

  return messages.join('; ');
}
