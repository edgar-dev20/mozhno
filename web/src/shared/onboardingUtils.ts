export function isOnboardingComplete(): boolean {
  try {
    return localStorage.getItem('onboarding-complete') === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingComplete() {
  try {
    localStorage.setItem('onboarding-complete', 'true');
  } catch {}
}

export function resetOnboardingComplete() {
  try {
    localStorage.removeItem('onboarding-complete');
  } catch {}
}
