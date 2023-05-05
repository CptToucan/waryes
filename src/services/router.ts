import {Route, Router} from '@vaadin/router';
import {Features, featureService} from './features';

const router = new Router(document.getElementById('main'));

const routes: Route[] = [
  {path: '/', component: 'index-route'},
  {path: '/units', component: 'units-route'},
  {path: '/unit/:unitId', component: 'unit-view-route'},
  {path: '/deck/:deckId', component: 'deck-view-route'},
  {path: '/comparison', component: 'comparison-route'},
  {path: '/deck-builder', component: 'deck-builder-route'},
  {path: '/deck-import', component: 'deck-import-route'},
  {path: '/deck-library', component: 'deck-library-route'},
  {path: '/forgot-password', component: 'forgot-password-route'},
  {path: '/privacy-policy', component: 'privacy-policy-route'},
  {path: '/verify-email', component: 'verify-email-route'},
  {path: '/user-settings', component: 'user-settings-route'},
  {path: '/my-decks', component: 'my-decks-route'},
  {path: '/division-analysis', component: 'division-analysis-route'},
];

// Features.firebase_auth routes
if (featureService.enabled(Features.firebase_auth)) {
  routes.push(
    {path: '/register', component: 'register-route'},
    {path: '/login', component: 'login-route'}
  );
}

router.setRoutes([
  {path: '/', component: 'application-route', children: routes},
]);

export {router};
