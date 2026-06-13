import { describe, it, expect, beforeEach } from 'vitest';
import { isOnboardingComplete, markOnboardingComplete, resetOnboardingComplete } from "@/shared/onboardingUtils";

describe('onboardingUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isOnboardingComplete', () => {
    it('returns false when not set', () => {
      expect(isOnboardingComplete()).toBe(false);
    });

    it('returns true when set to "true"', () => {
      localStorage.setItem('onboarding-complete', 'true');
      expect(isOnboardingComplete()).toBe(true);
    });

    it('returns false when set to other value', () => {
      localStorage.setItem('onboarding-complete', 'false');
      expect(isOnboardingComplete()).toBe(false);
    });

    it('returns false on localStorage error', () => {
      const orig = localStorage.getItem;
      localStorage.getItem = () => { throw new Error('blocked'); };
      expect(isOnboardingComplete()).toBe(false);
      localStorage.getItem = orig;
    });
  });

  describe('markOnboardingComplete', () => {
    it('sets the flag', () => {
      markOnboardingComplete();
      expect(localStorage.getItem('onboarding-complete')).toBe('true');
    });

    it('handles errors gracefully', () => {
      const orig = localStorage.setItem;
      localStorage.setItem = () => { throw new Error('blocked'); };
      expect(() => markOnboardingComplete()).not.toThrow();
      localStorage.setItem = orig;
    });
  });

  describe('resetOnboardingComplete', () => {
    it('removes the flag', () => {
      localStorage.setItem('onboarding-complete', 'true');
      resetOnboardingComplete();
      expect(localStorage.getItem('onboarding-complete')).toBeNull();
    });

    it('handles errors gracefully when not set', () => {
      expect(() => resetOnboardingComplete()).not.toThrow();
    });

    it('handles errors gracefully on localStorage error', () => {
      const orig = localStorage.removeItem;
      localStorage.removeItem = () => { throw new Error('blocked'); };
      expect(() => resetOnboardingComplete()).not.toThrow();
      localStorage.removeItem = orig;
    });
  });
});
