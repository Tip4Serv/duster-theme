/**
 * Generate a unique key for a cart item based on product ID and custom fields
 * This allows the same product with different custom field configurations to be treated as separate items
 */
export function generateCartItemKey(productId: number, customFields?: Record<string, any>): string {
  if (!customFields || Object.keys(customFields).length === 0) {
    return `product-${productId}`;
  }

  // Sort custom fields keys to ensure consistent hashing
  const sortedKeys = Object.keys(customFields).sort();
  const fieldsString = sortedKeys
    .map((key) => `${key}:${JSON.stringify(customFields[key])}`)
    .join('|');

  // Create a simple hash of the fields string
  let hash = 0;
  for (let i = 0; i < fieldsString.length; i++) {
    const char = fieldsString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `product-${productId}-fields-${Math.abs(hash)}`;
}

/**
 * Check if two custom field configurations are different
 */
export function areCustomFieldsDifferent(
  fields1?: Record<string, any>,
  fields2?: Record<string, any>
): boolean {
  const str1 = JSON.stringify(fields1 || {});
  const str2 = JSON.stringify(fields2 || {});
  return str1 !== str2;
}

/**
 * For number/range custom fields, charge only the increment beyond the free baseline.
 * Baseline uses default_value first, then minimum, otherwise 0.
 */
export function calculateNumberRangeCharge(
  field: { price?: number; default_value?: string | number; minimum?: number },
  rawValue: any
): number {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return 0;
  }

  const value = parseFloat(rawValue);
  if (Number.isNaN(value)) return 0;

  const baselineSource = field.default_value ?? field.minimum ?? 0;
  const baseline = parseFloat(baselineSource as any) || 0;
  const billableUnits = Math.max(value - baseline, 0);
  return (field.price || 0) * billableUnits;
}

/**
 * Get a formatted string of custom field selections for display
 */
export function formatCustomFieldsForDisplay(
  customFields: Record<string, any>,
  productCustomFields: Array<{
    id: number;
    name?: string;
    label?: string;
    type: string;
    options?: Array<{ id: number; name?: string; label?: string }>;
  }>
): string {
  if (!customFields || Object.keys(customFields).length === 0) {
    return '';
  }

  const parts: string[] = [];

  productCustomFields.forEach((field) => {
    const key = field.id.toString();
    const value = customFields[key];

    if (value === undefined || value === null || value === '') {
      return;
    }

    // Get field display name (prefer name, fallback to label)
    const fieldName = field.name || field.label;
    if (!fieldName) {
      return; // Skip if we can't find a name
    }

    if (field.type === 'checkbox') {
      if (value) {
        parts.push(fieldName);
      }
    } else if (field.type === 'select' || field.type === 'selection' || field.type === 'dropdown' || field.type === 'choice') {
      if (field.options) {
        const option = field.options.find((opt) => opt.id.toString() === value.toString());
        if (option) {
          const optionName = option.name || option.label;
          if (optionName) {
            parts.push(`${fieldName}: ${optionName}`);
          }
        }
      }
    } else if (field.type === 'number' || field.type === 'range' || field.type === 'text') {
      parts.push(`${fieldName}: ${value}`);
    }
  });

  return parts.join(', ');
}
