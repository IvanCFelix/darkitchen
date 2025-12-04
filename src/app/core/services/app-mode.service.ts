import { Injectable, signal } from '@angular/core';

export type AppMode = 'user' | 'darkitchen';

@Injectable({
    providedIn: 'root'
})
export class AppModeService {
    private readonly STORAGE_KEY = 'darkitchen_app_mode';
    private modeSignal = signal<AppMode>(this.loadModeFromStorage());

    private loadModeFromStorage(): AppMode {
        const savedMode = localStorage.getItem(this.STORAGE_KEY);
        return (savedMode === 'darkitchen' || savedMode === 'user') ? savedMode : 'user';
    }

    private saveModeToStorage(mode: AppMode): void {
        localStorage.setItem(this.STORAGE_KEY, mode);
    }

    get mode() {
        return this.modeSignal();
    }

    get isUserMode() {
        return this.modeSignal() === 'user';
    }

    get isDarkitchenMode() {
        return this.modeSignal() === 'darkitchen';
    }

    toggleMode(): void {
        const newMode = this.modeSignal() === 'user' ? 'darkitchen' : 'user';
        this.modeSignal.set(newMode);
        this.saveModeToStorage(newMode);
    }

    setMode(mode: AppMode): void {
        this.modeSignal.set(mode);
        this.saveModeToStorage(mode);
    }

    getModeSignal() {
        return this.modeSignal.asReadonly();
    }
}
