import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Request } from '../../../core/models';

@Component({
    selector: 'app-request-card',
    templateUrl: './request-card.component.html',
    styleUrls: ['./request-card.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class RequestCardComponent {
    @Input() request!: Request;
    @Input() showAcceptButton: boolean = false;
    @Input() acceptButtonText: string = 'Yo lo preparo';
    @Output() cardClick = new EventEmitter<Request>();
    @Output() acceptClick = new EventEmitter<Request>();

    getTimeRemaining(): string {
        const now = new Date().getTime();
        const expires = this.request.expiresAt.toMillis();
        const remaining = expires - now;

        if (remaining <= 0) return 'Expirada';

        const minutes = Math.floor(remaining / 60000);
        return minutes.toString();
    }

    onCardClick(): void {
        this.cardClick.emit(this.request);
    }

    onAcceptClick(event: Event): void {
        event.stopPropagation();
        this.acceptClick.emit(this.request);
    }
}
