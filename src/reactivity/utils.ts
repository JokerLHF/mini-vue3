export function hasChanged(value: any, oldValue: any) {
  return value !== oldValue && (value === value || oldValue === oldValue);
}

export function isObject(target: any) {
  return Object.prototype.toString.call(target) === '[object Object]';
}

export function isFunction(target: any) {
  return Object.prototype.toString.call(target) === '[object Function]';
}