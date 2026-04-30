import { Routes } from '@angular/router';
import { LoginComponent } from './login-component/login-component';
import { GruposComponent } from './grupos-component/grupos-component';
import { GrupoDetalleComponent } from './grupo-detalle-component/grupo-detalle-component';
import { PerfilComponent } from './perfil-component/perfil-component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'grupos', component: GruposComponent },
    { path: 'grupos/:id', component: GrupoDetalleComponent },
    { path: 'perfil', component: PerfilComponent }
];