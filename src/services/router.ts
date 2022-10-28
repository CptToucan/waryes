import { Router } from '@vaadin/router';

const router = new Router(document.getElementById("main"));

router.setRoutes([
  {path: '/',
    component: 'application-route',
    children: [
      {path: '/', component: 'index-route'},
      {path: '/register', component: 'register-route'},
      {path: '/login', component: 'login-route'},
      {path: '/units', component: 'units-route'},
      {path: '/unit/:unitId', component: 'unit-view-route'},
      {path: '/comparison', component: 'comparison-route'},
    ]
  }
]);

export { router }