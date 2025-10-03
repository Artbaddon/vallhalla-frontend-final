export const extractArray = (response, options = {}) => {
  const {
    dataKey,
    fallbackKeys = [],
    defaultValue = [],
    transform,
  } = options;

  if (!response) {
    return defaultValue;
  }

  const applyTransform = (value) => {
    if (!Array.isArray(value)) {
      return defaultValue;
    }
    return typeof transform === 'function' ? transform(value) : value;
  };

  if (Array.isArray(response)) {
    return applyTransform(response);
  }

  if (dataKey && Array.isArray(response[dataKey])) {
    return applyTransform(response[dataKey]);
  }

  if (
    dataKey &&
    response.data &&
    typeof response.data === 'object' &&
    Array.isArray(response.data[dataKey])
  ) {
    return applyTransform(response.data[dataKey]);
  }

  if (Array.isArray(response.data)) {
    return applyTransform(response.data);
  }

  for (const key of fallbackKeys) {
    if (Array.isArray(response[key])) {
      return applyTransform(response[key]);
    }
    if (
      response.data &&
      typeof response.data === 'object' &&
      Array.isArray(response.data[key])
    ) {
      return applyTransform(response.data[key]);
    }
  }

  console.warn('extractArray: no array found in response', response);
  return defaultValue;
};

export const ensureArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};
