import { Routes } from '@angular/router';
import { LayoutComponent, type LayoutRouteData } from './layout';

export const LAYOUT_ROUTES: Routes = [
  {
    path: 'generala',
    component: LayoutComponent,
    data: {
      title: 'Anotador de Generala',
      action: 'reset'
    } satisfies LayoutRouteData,
    children: [
      { path: '', loadChildren: () => import('../features/generala/generala.routes').then(m => m.routes) }
    ]
  },
  {
    path: 'truco',
    component: LayoutComponent,
    data: {
      title: 'Truco',
      action: 'reset'
    } satisfies LayoutRouteData,
    children: [
      { path: '', loadComponent: () => import('../features/truco/components/truco/truco.component').then(m => m.TrucoComponent) }
    ]
  },
  {
    path: 'mus',
    component: LayoutComponent,
    data: {
      title: 'Mus',
      actions: ['undo', 'reset']
    } satisfies LayoutRouteData,
    children: [
      { path: '', loadComponent: () => import('../features/mus/components/mus/mus.component').then(m => m.MusComponent) }
    ]
  },
  {
    path: 'share-receiver',
    component: LayoutComponent,
    data: {
      title: 'Recibir Comparte',
    } satisfies LayoutRouteData,
    children: [
      { path: '', loadComponent: () => import('../features/share-receiver/components/share-receiver/share-receiver.component').then(m => m.ShareReceiverComponent) }
    ]
  },
  {
    path: 'team-builder',
    component: LayoutComponent,
    data: {
      title: 'Team Builder',
      action: 'share'
    } satisfies LayoutRouteData,
    children: [
      { path: '', loadComponent: () => import('../features/team-builder/components/team-builder/team-builder.component').then(m => m.TeamBuilder) }
    ]
  }
];

