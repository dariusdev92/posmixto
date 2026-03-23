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
        path: 'truco',
        loadComponent: () => import('./features/truco/truco').then(m => m.TrucoComponent)
    },
    {
        path: 'share-receiver',
        loadComponent: () => import('./features/share-receiver/share-receiver').then(m => m.ShareReceiverComponent)
    },
    {
        path: 'team-builder',
        loadComponent: () => import('./features/team-builder/team-builder').then(m => m.TeamBuilder)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
