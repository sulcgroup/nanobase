import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { NoAuthGuard } from './no-auth.guard';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './verify/verify.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ResetComponent } from './reset/reset.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  { path: 'forgot', component: ForgotComponent, canActivate: [NoAuthGuard] },
  { path: 'reset', component: ResetComponent, canActivate: [NoAuthGuard] },
  { path: 'verify', component: VerifyComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full', canActivate: [NoAuthGuard] },
  { path: 'auth', redirectTo: '/auth/login', pathMatch: 'full', canActivate: [NoAuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
