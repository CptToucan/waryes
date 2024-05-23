import {Route, Router} from '@vaadin/router';
import {Features, featureService} from './features';

const router = new Router(document.getElementById('main'));

const routes: Route[] = [
  {path: '/', component: 'index-route'},
  {path: '/units', component: 'units-route'},
  {path: '/weapons', component: 'weapons-route'},
  {path: '/unit/:unitId', component: 'unit-view-route'},
  {path: '/weapon/:weaponId', component: 'weapon-view-route'},
  {path: '/deck/:deckId', component: 'deck-view-route'},
  {path: '/comparison', component: 'comparison-route'},
  {path: '/deck-builder', component: 'deck-builder-route'},
  {path: '/deck-builder/:divisionId', component: 'deck-builder-route'},
  {path: '/deck-import', component: 'deck-import-route'},
  {path: '/deck-library', component: 'deck-library-route'},
  {path: '/forgot-password', component: 'forgot-password-route'},
  {path: '/privacy-policy', component: 'privacy-policy-route'},
  {path: '/verify-email', component: 'verify-email-route'},
  {path: '/user-settings', component: 'user-settings-route'},
  {path: '/my-decks', component: 'my-decks-route'},
  {path: '/division-analysis', component: 'division-analysis-route'},
  {path: '/patch-notes', component: 'patch-notes-route'},
  {path: '/maps', component: 'maps-route'},
  {path: '/deck-drafter', component: 'deck-drafter-route'},
  {path: '/deck-drafter/:sessionId', component: 'deck-draft-route'},
  {path: '/damage-calculator/:unitId', component: 'damage-calculator-route'},
  {path: '/damage-calculator', component: 'damage-calculator-route'},
  {path: '/defcon2', component: 'defcon2-route'},
  {path: '/upload-bundle', component: 'upload-bundle-route'},
  {path: '/game-knowledge', component: 'game-knowledge-route'},
  {path: '/game-knowledge/:slug', component: 'single-knowledge-route'},
  {path: '/pick-ban-tool', component: 'pick-ban-tool-route'},
  {path: '/pick-ban-tool/:sessionId', component: 'pick-ban-session-route'},
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
