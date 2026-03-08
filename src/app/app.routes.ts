import { Routes } from '@angular/router';
import { Home } from './features/home/home';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        pathMatch: 'full'
    },
    {
        path: 'generala',
        loadChildren: () => import('./features/generala/generala.routes').then(m => m.routes)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
