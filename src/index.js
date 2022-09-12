import { Router } from '@vaadin/router';

const router = new Router(document.getElementById("main"));

router.setRoutes([
  {path: '/',
    component: 'application-route',
    children: [
      {path: '/', component: 'index-route'},
      {path: '/register', component: 'register-route'}
    ]
  }
]);


/** Routes */
import "./routes/application";
import "./routes/index";
import "./routes/register";


/** Components */

import "../styles/app.css";