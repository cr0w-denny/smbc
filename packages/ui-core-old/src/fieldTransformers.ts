/**
 * Generic field transformer for URL/UI parameter conversions
 */
export const createFieldTransformer = (config: {
  arrayFields?: string[];
  booleanFields?: string[];
  dateFields?: string[];
  numberFields?: string[];
  dateRangeFields?: string[];
}) => ({
  ui: (urlParams: any) => {
    const result = { ...urlParams };

    // Arrays: CSV string -> array
    config.arrayFields?.forEach(field => {
      const value = urlParams[field];
      if (Array.isArray(value)) {
        result[field] = value; // Already an array
      } else if (typeof value === 'string' && value) {
        result[field] = value.split(',');
      } else {
        result[field] = [];
      }
    });

    // Booleans: string -> boolean
    config.booleanFields?.forEach(field => {
      const value = urlParams[field];
      if (typeof value === 'boolean') {
        result[field] = value; // Already a boolean
      } else {
        result[field] = value === "true" || value === true;
      }
    });

    // Dates: ISO string -> Date or null
    config.dateFields?.forEach(field => {
      const value = urlParams[field];
      if (value instanceof Date) {
        result[field] = value; // Already a Date
      } else if (typeof value === 'string' && value) {
        // Parse date string in local timezone to avoid timezone shift
        // For YYYY-MM-DD format, create date in local timezone
        const parts = value.split('-');
        if (parts.length === 3) {
          result[field] = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          result[field] = new Date(value);
        }
      } else {
        result[field] = null;
      }
    });

    // Numbers: string -> number or null
    config.numberFields?.forEach(field => {
      const value = urlParams[field];
      if (typeof value === 'number') {
        result[field] = value; // Already a number
      } else if (value) {
        result[field] = Number(value);
      } else {
        result[field] = null;
      }
    });

    // Date ranges: JSON string -> object
    config.dateRangeFields?.forEach(field => {
      try {
        result[field] = urlParams[field] ? JSON.parse(urlParams[field]) : { from: null, to: null };
      } catch {
        result[field] = { from: null, to: null };
      }
    });

    return result;
  },

  url: (uiParams: any) => {
    const result = { ...uiParams };

    // Arrays: array -> CSV string
    config.arrayFields?.forEach(field => {
      result[field] = Array.isArray(uiParams[field]) ? uiParams[field].join(',') : '';
    });

    // Booleans: boolean -> string
    config.booleanFields?.forEach(field => {
      result[field] = uiParams[field] ? "true" : "";
    });

    // Dates: Date -> ISO date string (YYYY-MM-DD for date inputs)
    config.dateFields?.forEach(field => {
      const value = uiParams[field];
      result[field] = value instanceof Date ? value.toISOString().split('T')[0] : (value || "");
    });

    // Numbers: number -> string
    config.numberFields?.forEach(field => {
      const value = uiParams[field];
      result[field] = value !== null && value !== undefined ? String(value) : "";
    });

    // Date ranges: object -> JSON string
    config.dateRangeFields?.forEach(field => {
      const value = uiParams[field];
      result[field] = value && (value.from || value.to) ? JSON.stringify(value) : "";
    });

    return result;
  }
});