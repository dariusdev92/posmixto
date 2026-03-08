import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'generala',
        loadChildren: () => import('./features/generala/generala.routes').then(m => m.routes)
    },
    {
        path: '',
        redirectTo: 'generala',
        pathMatch: 'full'
    }
];
