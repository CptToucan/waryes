import { Router } from '@vaadin/router';

const router = new Router(document.getElementById("main"));

router.setRoutes([
  {path: '/',
    component: 'application-route',
    children: [
      {path: '/', component: 'index-route'},
      {path: '/register', component: 'register-route'},
      {path: '/login', component: 'login-route'}
    ]
  }
]);

export { router }