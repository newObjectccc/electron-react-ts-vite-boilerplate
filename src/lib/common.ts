export const typeToString = (val: unknown) => {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
};

export const isValidString = (str: string) => {
  return typeToString(str) === 'string' && str !== '';
};

export const isNullOrUndefined = (val: unknown) => {
  return val === void 0 || val === null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidValue = (val: any) => {
  if (isNullOrUndefined(val)) return false;
  if (typeToString(val) === 'string') return isValidString(val);
  if (typeToString(val) === 'number') return isValidNumber(val);
  if (typeToString(val) === 'object') return !isEmptyObject(val);
  if (typeToString(val) === 'array') return !isEmptyArray(val);
  return true;
};

export const isValidArray = (arr: Array<unknown>) => {
  if (!Array.isArray(arr)) return false;
  if (isEmptyArray(arr)) return false;
  return true;
};

export const isEmptyObject = (obj: object) => {
  if (typeToString(obj) !== 'object') return false;
  if (Reflect.ownKeys(obj).length === 0) return false;
  return true;
};

export const isEmptyArray = (arr: Array<unknown>) => {
  if (typeToString(arr) !== 'array') return false;
  if (arr.filter((i) => i !== void 0).length <= 0) return true;
  return false;
};

export const isValidNumber = (num: number | string) => {
  const normalizedNum = parseInt(num as string);
  return typeToString(normalizedNum) === 'number' && !Number.isNaN(normalizedNum);
};

export const isValidNumberStrict = (num: number) => {
  return typeToString(num) === 'number' && !Number.isNaN(num);
};

export const isBiggerThan1 = (val: number | string) => {
  const normalized = parseInt(val as string);
  if (!isValidNumber(normalized)) return false;
  if (normalized <= 1) return false;
  return true;
};

export const isBiggerOrEqualThan1 = (val: number | string) => {
  const normalized = parseInt(val as string);
  if (isNaN(normalized)) return false;
  if (normalized < 1) return false;
  return true;
};

export const isChinaLandMobile = (str: string) => {
  if (!isValidNumber(str) || !isValidString(str)) return false;
  return /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(str);
};
