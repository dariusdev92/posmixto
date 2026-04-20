import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { LAYOUT_ROUTES } from './layout/routes';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        pathMatch: 'full'
    },
    ...LAYOUT_ROUTES,
    {
        path: '**',
        redirectTo: ''
    }
];
