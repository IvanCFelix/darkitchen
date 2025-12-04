import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const noAuthGuard = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return authState(auth).pipe(
        take(1),
        map(user => {
            if (!user) {
                return true;
            }
            router.navigate(['/home']);
            return false;
        })
    );
};
