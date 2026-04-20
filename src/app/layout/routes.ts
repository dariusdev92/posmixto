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
      { path: '', loadComponent: () => import('../features/truco/truco').then(m => m.TrucoComponent) }
    ]
  },
  {
    path: 'share-receiver',
    component: LayoutComponent,
    data: {
      title: 'Recibir Comparte',
      action: 'none'
    } satisfies LayoutRouteData,
    children: [
      { path: '', loadComponent: () => import('../features/share-receiver/share-receiver').then(m => m.ShareReceiverComponent) }
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
      { path: '', loadComponent: () => import('../features/team-builder/team-builder').then(m => m.TeamBuilder) }
    ]
  }
];
