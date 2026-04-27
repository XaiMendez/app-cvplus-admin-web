import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/pages/login.component';
import { MembershipsListComponent } from './modules/memberships/ui/memberships-list.component';
import { CustomersListComponent } from './modules/customers/ui/customers-list.component';
import { LoyaltyAccountsListComponent } from './modules/loyalty/ui/loyalty-accounts-list.component';
import { LoyaltyTransactionsComponent } from './modules/loyalty/ui/loyalty-transactions.component';
import { LoyaltyRulesComponent } from './modules/loyalty/ui/loyalty-rules.component';
import { SelfRegistrationFormComponent } from './modules/self-registration/ui/self-registration-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'memberships', component: MembershipsListComponent },
  { path: 'customers', component: CustomersListComponent },
  { path: 'loyalty/accounts', component: LoyaltyAccountsListComponent },
  { path: 'loyalty/transactions/:customerId', component: LoyaltyTransactionsComponent },
  { path: 'loyalty/rules', component: LoyaltyRulesComponent },
  { path: 'self-registration', component: SelfRegistrationFormComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
