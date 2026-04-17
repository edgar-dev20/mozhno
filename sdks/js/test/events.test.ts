import { describe, it, expect } from 'vitest';
import { EventEmitter } from '../src/events';

describe('EventEmitter', () => {
  it('emits to listeners', () => {
    const ee = new EventEmitter();
    let called = false;
    ee.on('test', () => { called = true; });
    ee.emit('test');
    expect(called).toBe(true);
  });

  it('passes arguments', () => {
    const ee = new EventEmitter();
    let value = '';
    ee.on('test', (v: string) => { value = v; });
    ee.emit('test', 'hello');
    expect(value).toBe('hello');
  });

  it('off removes listener', () => {
    const ee = new EventEmitter();
    let count = 0;
    const fn = () => { count++; };
    ee.on('test', fn);
    ee.emit('test');
    ee.off('test', fn);
    ee.emit('test');
    expect(count).toBe(1);
  });

  it('removeAll', () => {
    const ee = new EventEmitter();
    let count = 0;
    ee.on('test', () => { count++; });
    ee.on('test2', () => { count++; });
    ee.removeAll();
    ee.emit('test');
    ee.emit('test2');
    expect(count).toBe(0);
  });
});
