import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/pages/login.component';
import { MembershipsListComponent } from './modules/memberships/ui/memberships-list.component';
import { CustomersListComponent } from './modules/customers/ui/customers-list.component';
import { LoyaltyAccountsListComponent } from './modules/loyalty/ui/loyalty-accounts-list.component';
import { LoyaltyTransactionsComponent } from './modules/loyalty/ui/loyalty-transactions.component';
import { LoyaltyRulesComponent } from './modules/loyalty/ui/loyalty-rules.component';
import { SelfRegistrationFormComponent } from './modules/self-registration/ui/self-registration-form.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'self-registration', component: SelfRegistrationFormComponent },
  { path: 'memberships', component: MembershipsListComponent, canActivate: [authGuard] },
  { path: 'customers', component: CustomersListComponent, canActivate: [authGuard] },
  { path: 'loyalty/accounts', component: LoyaltyAccountsListComponent, canActivate: [authGuard] },
  { path: 'loyalty/transactions/:customerId', component: LoyaltyTransactionsComponent, canActivate: [authGuard] },
  { path: 'loyalty/rules', component: LoyaltyRulesComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'self-registration', pathMatch: 'full' }
];
