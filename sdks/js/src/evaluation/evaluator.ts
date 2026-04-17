import type { FeatureFlag, Constraint, MozhnoContext } from '../types';

function murmurHash32(data: string): number {
  const bytes = new TextEncoder().encode(data);
  const length = bytes.length;
  let h1 = 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  for (let i = 0; i + 4 <= length; i += 4) {
    let k1 = (bytes[i] & 0xff) | ((bytes[i + 1] & 0xff) << 8) |
             ((bytes[i + 2] & 0xff) << 16) | ((bytes[i + 3] & 0xff) << 24);
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
    h1 = h1 | 0;
  }

  let k1 = 0;
  const tail = length & 3;
  if (tail >= 3) k1 ^= (bytes[length - 3] & 0xff) << 16;
  if (tail >= 2) k1 ^= (bytes[length - 2] & 0xff) << 8;
  if (tail >= 1) {
    k1 ^= (bytes[length - 1] & 0xff);
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
    h1 = h1 | 0;
  }

  h1 ^= length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 = h1 | 0;
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 = h1 | 0;
  h1 ^= h1 >>> 16;

  return h1;
}

function compareSemver(a: string, b: string): number {
  const pa = a.replace(/[^0-9.]/g, '').split('.').map(Number);
  const pb = b.replace(/[^0-9.]/g, '').split('.').map(Number);
  const maxLen = Math.max(pa.length, pb.length);
  for (let i = 0; i < maxLen; i++) {
    const va = i < pa.length ? (isNaN(pa[i]) ? 0 : pa[i]) : 0;
    const vb = i < pb.length ? (isNaN(pb[i]) ? 0 : pb[i]) : 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

function compareValues(contextType: string | undefined, a: string, b: string): number {
  if (contextType === 'number') {
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) {
      return na - nb;
    }
    return a.localeCompare(b);
  }
  if (contextType === 'time') {
    const ta = Date.parse(a);
    const tb = Date.parse(b);
    if (!isNaN(ta) && !isNaN(tb)) {
      return ta - tb;
    }
    return a.localeCompare(b);
  }
  if (contextType === 'semver') {
    return compareSemver(a, b);
  }
  return a.localeCompare(b);
}

function evaluateConstraintOp(operator: string, contextType: string | undefined, contextValue: string, checkValue: string): boolean {
  switch (operator) {
    case 'in':
      return contextValue === checkValue;
    case 'not_in':
      return contextValue !== checkValue;
    case 'eq':
      if (contextType === 'number') {
        const na = Number(contextValue);
        const nb = Number(checkValue);
        return !isNaN(na) && !isNaN(nb) ? na === nb : contextValue === checkValue;
      }
      return contextValue === checkValue;
    case 'ne':
      if (contextType === 'number') {
        const na = Number(contextValue);
        const nb = Number(checkValue);
        return !isNaN(na) && !isNaN(nb) ? na !== nb : contextValue !== checkValue;
      }
      return contextValue !== checkValue;
    case 'gt':
      return compareValues(contextType, contextValue, checkValue) > 0;
    case 'gte':
      return compareValues(contextType, contextValue, checkValue) >= 0;
    case 'lt':
      return compareValues(contextType, contextValue, checkValue) < 0;
    case 'lte':
      return compareValues(contextType, contextValue, checkValue) <= 0;
    case 'contains':
      return contextValue.includes(checkValue);
    default:
      return false;
  }
}

function evaluateConstraints(constraints: Constraint[], context: MozhnoContext): boolean {
  if (!constraints || constraints.length === 0) return true;

  for (const c of constraints) {
    const fieldValue = context[c.field];
    if (fieldValue === undefined) return false;

    const operator = c.operator || 'in';
    const values = c.values || [];
    const contextType = c.contextType;

    if (operator === 'in') {
      if (!values.includes(fieldValue)) return false;
    } else if (operator === 'not_in') {
      if (values.includes(fieldValue)) return false;
    } else {
      if (!values.some(v => evaluateConstraintOp(operator, contextType, fieldValue, v))) {
        return false;
      }
    }
  }
  return true;
}

export function isFlagEnabled(flag: FeatureFlag, context: MozhnoContext): boolean {
  if (!flag.enabled) return false;

  const activation = flag.activation;
  if (!activation) return true;

  if (!evaluateConstraints(activation.constraints || [], context)) return false;

  const rollOut = activation.rollOut;
  if (rollOut != null) {
    if (rollOut >= 100) return true;
    if (rollOut <= 0) return false;
    const seed = flag.key + (context.userId || context.sessionId || '');
    const hash = murmurHash32(seed);
    const bucket = Math.abs(hash) % 100;
    return bucket < rollOut;
  }

  return true;
}
