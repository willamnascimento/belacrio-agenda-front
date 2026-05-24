import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardPageComponent } from './pages/dashboard/containers';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import {AuthGuard} from './pages/auth/guards';
import { ConfirmacaoComponent } from './pages/confirmacao/confirmacao.component';

const routes: Routes = [
  {
    path: 'agenda',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/calendar/calendar.module').then(m => m.CalendarModule)
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    component: DashboardPageComponent
  },
  {
    path: 'typography',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/typography/typography.module').then(m => m.TypographyModule)
  },
  {
    path: 'tables',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/tables/tables.module').then(m => m.TablesModule)
  },
  {
    path: 'notification',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/notification/notification.module').then(m => m.NotificationModule)
  },
  {
    path: 'ui',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/ui-elements/ui-elements.module').then(m => m.UiElementsModule)
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'pessoas',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/people/people.module').then(m => m.PeopleModule)
  },
  {
    path: 'clientes',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/clients/clients.module').then(m => m.ClientsModule)
  },
  {
    path: 'especificacoes',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/specifications/specifications.module').then(m => m.SpecificationsModule)
  },
  {
    path: 'equipamentos',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/equipaments/equipaments.module').then(m => m.EquipamentsModule)
  },
  {
    path: 'agendamentos',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/schedules/schedules.module').then(m => m.SchedulesModule)
  },
  {
    path: 'usuario',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./shared/header/components/user/user.module' ).then(m => m.UserModule)
  },
  {
    path: 'usuarios',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./shared/header/components/settings/settings.module' ).then(m => m.UsersModule)
  },
  {
    path: 'disponibilidade',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/availability/availability.module' ).then(m => m.AvailabilityModule)
  },
  {
    path: 'configuracao-modelo',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/model-configuration/model-configuration.module' ).then(m => m.ModelConfigurationModule)
  },
  {
    path: 'gerar-contratos',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/generate-contract/generate-contract.module' ).then(m => m.GenerateContractModule)
  },
  {
    path: 'gerar-contratos-anual',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/generate-contract-anual/generate-contract-anual.module' ).then(m => m.GenerateContractAnualModule)
  },
  {
    path: 'consumiveis',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/consumables/consumables.module' ).then(m => m.ConsumablesModule)
  },
  {
    path: 'lancar-consumiveis',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/calendar-consumable/calendar-consumable.module' ).then(m => m.CalendarConsumableModule)
  },
  {
    path: 'equipamentos-cliente',
    canActivate: [AuthGuard],
    loadChildren: () => import('./shared/header/components/client-equipment/client-equipment.module' ).then(m => m.ClientEquipmentModule)
  },
  {
    path: 'agenda-em-lote',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/bulk-scheduling/bulk-scheduling.module' ).then(m => m.BulkSchedulingModule)
  },
  {
    path: 'faturamento',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/invoicing/invoicing.module' ).then(m => m.InvoicingModule)
  }, 
  {
    path: 'tabela-preco',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/price-table/price-table.module' ).then(m => m.PriceTableModule)
  }, 
  {
    path: 'confirmacao',
    component: ConfirmacaoComponent
  },
  {
    path: '**',
    redirectTo: '404'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
