import { describe, it, expect } from 'vitest';
import {
  userDtoSchema,
  projectSchema,
  environmentSchema,
  flagResponseSchema,
  segmentResponseSchema,
  tagSchema,
  contextDefinitionSchema,
} from '@/api/schemas';

const validUserDto = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  status: 'active',
  avatar: null,
  createdAt: '2025-01-01T00:00:00Z',
  lastActiveAt: '2025-06-01T00:00:00Z',
};

const validProject = {
  id: 1,
  name: 'My Project',
  description: 'A test project',
  logo: null,
  createdAt: '2025-01-01T00:00:00Z',
};

const validEnvironment = {
  id: 1,
  projectId: 10,
  name: 'production',
  createdAt: '2025-01-01T00:00:00Z',
};

const validFlagResponse = {
  id: 1,
  projectId: 10,
  name: 'Feature X',
  key: 'feature-x',
  description: 'Toggles feature X',
  flagType: 'boolean',
  createdAt: '2025-01-01T00:00:00Z',
  createdBy: null,
  lastUsedAt: null,
  archivedBy: null,
  archivedAt: null,
  tags: [],
  enabled: false,
  strategyId: 1,
  percentage: 100,
  contextDefinitionId: 5,
  contextValuesJson: '{}',
  segmentIds: [],
  archived: false,
};

const validSegmentResponse = {
  id: 1,
  projectId: 10,
  name: 'VIP Users',
  description: 'Premium segment',
  icon: 'star',
  color: '#ff0000',
  createdAt: '2025-01-01T00:00:00Z',
  context: [],
};

const validTag = {
  id: 1,
  projectId: 10,
  name: 'experiment',
  description: 'Experimental flag',
  color: '#00ff00',
  createdAt: '2025-01-01T00:00:00Z',
};

const validContextDefinition = {
  id: 1,
  projectId: 10,
  name: 'User Country',
  key: 'country',
  type: 'string',
  createdBy: null,
  description: 'Country of the user',
  createdAt: '2025-01-01T00:00:00Z',
};

function stripField<T extends Record<string, unknown>>(obj: T, field: keyof T): Partial<T> {
  const { [field]: _, ...rest } = obj;
  return rest;
}

function withWrongType<T extends Record<string, unknown>>(obj: T, field: keyof T): T & Record<string, unknown> {
  return { ...obj, [field]: 'not-the-right-type' };
}

describe('userDtoSchema', () => {
  it('parses valid data', () => {
    expect(() => userDtoSchema.parse(validUserDto)).not.toThrow();
  });

  it('throws on missing required field', () => {
    expect(() => userDtoSchema.parse(stripField(validUserDto, 'email'))).toThrow();
  });

  it('rejects wrong type (coercion does not happen)', () => {
    expect(() => userDtoSchema.parse(withWrongType(validUserDto, 'id'))).toThrow();
  });
});

describe('projectSchema', () => {
  it('parses valid data', () => {
    expect(() => projectSchema.parse(validProject)).not.toThrow();
  });

  it('throws on missing required field', () => {
    expect(() => projectSchema.parse(stripField(validProject, 'name'))).toThrow();
  });

  it('rejects wrong type (coercion does not happen)', () => {
    expect(() => projectSchema.parse(withWrongType(validProject, 'id'))).toThrow();
  });
});

describe('environmentSchema', () => {
  it('parses valid data', () => {
    expect(() => environmentSchema.parse(validEnvironment)).not.toThrow();
  });

  it('throws on missing required field', () => {
    expect(() => environmentSchema.parse(stripField(validEnvironment, 'name'))).toThrow();
  });

  it('rejects wrong type (coercion does not happen)', () => {
    expect(() => environmentSchema.parse(withWrongType(validEnvironment, 'id'))).toThrow();
  });
});

describe('flagResponseSchema', () => {
  it('parses valid data', () => {
    expect(() => flagResponseSchema.parse(validFlagResponse)).not.toThrow();
  });

  it('throws on missing required field', () => {
    expect(() => flagResponseSchema.parse(stripField(validFlagResponse, 'name'))).toThrow();
  });

  it('rejects wrong type (coercion does not happen)', () => {
    expect(() => flagResponseSchema.parse(withWrongType(validFlagResponse, 'id'))).toThrow();
  });
});

describe('segmentResponseSchema', () => {
  it('parses valid data', () => {
    expect(() => segmentResponseSchema.parse(validSegmentResponse)).not.toThrow();
  });

  it('throws on missing required field', () => {
    expect(() => segmentResponseSchema.parse(stripField(validSegmentResponse, 'name'))).toThrow();
  });

  it('rejects wrong type (coercion does not happen)', () => {
    expect(() => segmentResponseSchema.parse(withWrongType(validSegmentResponse, 'id'))).toThrow();
  });
});

describe('tagSchema', () => {
  it('parses valid data', () => {
    expect(() => tagSchema.parse(validTag)).not.toThrow();
  });

  it('throws on missing required field', () => {
    expect(() => tagSchema.parse(stripField(validTag, 'name'))).toThrow();
  });

  it('rejects wrong type (coercion does not happen)', () => {
    expect(() => tagSchema.parse(withWrongType(validTag, 'id'))).toThrow();
  });
});

describe('contextDefinitionSchema', () => {
  it('parses valid data', () => {
    expect(() => contextDefinitionSchema.parse(validContextDefinition)).not.toThrow();
  });

  it('throws on missing required field', () => {
    expect(() => contextDefinitionSchema.parse(stripField(validContextDefinition, 'name'))).toThrow();
  });

  it('rejects wrong type (coercion does not happen)', () => {
    expect(() => contextDefinitionSchema.parse(withWrongType(validContextDefinition, 'id'))).toThrow();
  });
});
