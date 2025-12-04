import { Injectable, signal } from '@angular/core';

export type AppMode = 'user' | 'darkitchen';

@Injectable({
    providedIn: 'root'
})
export class AppModeService {
    private modeSignal = signal<AppMode>('user');

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
        this.modeSignal.set(this.modeSignal() === 'user' ? 'darkitchen' : 'user');
    }

    setMode(mode: AppMode): void {
        this.modeSignal.set(mode);
    }

    getModeSignal() {
        return this.modeSignal.asReadonly();
    }
}
