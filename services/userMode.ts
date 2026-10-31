// services/userMode.ts
// Manages the user's active experience: 'farm_owner' (hiring a farmer) vs 'food_buyer' (buying food)

export type UserIntent = 'farm_owner' | 'food_buyer';

const STORAGE_KEY = 'myfarm_active_intent';

class UserModeManager {
  private currentIntent: UserIntent = 'farm_owner';
  private listeners: Array<(intent: UserIntent) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY) as UserIntent;
      if (saved === 'farm_owner' || saved === 'food_buyer') {
        this.currentIntent = saved;
      }
    }
  }

  getIntent(): UserIntent {
    return this.currentIntent;
  }

  setIntent(intent: UserIntent) {
    this.currentIntent = intent;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, intent);
    }
    this.notify();
  }

  subscribe(listener: (intent: UserIntent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentIntent));
  }
}

export const userMode = new UserModeManager();
