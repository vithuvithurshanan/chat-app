import { RouterModule, Routes } from '@angular/router';
import {Signup} from './pages/signup/signup';
import {Login} from './pages/login/login';
import {ChatComponents} from './pages/chat/chat';
import {NgModule} from "@angular/core";
import {Home} from "./pages/home/home";
export const routes: Routes = [
  {path: '',
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
},
{
  path: '**',
    redirectTo: 'login', // 👈 not found -> login
}
];
@NgModule({
  imports:[RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule{}
