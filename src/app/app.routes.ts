import { Routes } from '@angular/router';
import { Signup } from './pages/signup/signup';
import { Login } from './pages/login/login';
import { ChatComponents } from './pages/chat/chat';
import { Home } from './pages/home/home';
import { AuthGuard } from './services/auth';  // guard தனியா file

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'signup',
    component: Signup,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'chat',
    component: ChatComponents,
    canActivate: [AuthGuard], // ✅ guard apply
  },
  {
    path: '**',
    redirectTo: 'login', // 👈 not found → login
  },
];
