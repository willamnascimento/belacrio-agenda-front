import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './pages/dashboard/dashboard.module';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthModule } from './pages/auth/auth.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { PeopleModule } from './pages/people/people.module';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { HttpClientModule } from '@angular/common/http';
import { InterceptorModule } from './shared/interceptor/interceptor.module';
import { MatNativeDateModule } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import { ConfirmacaoComponent } from './pages/confirmacao/confirmacao.component';
registerLocaleData(localePT);

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    ConfirmacaoComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    HttpClientModule,
    AuthModule,
    DashboardModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    InterceptorModule,
    PeopleModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
    NgxMaskModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NgxMaskModule.forRoot(),
    MatNativeDateModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
