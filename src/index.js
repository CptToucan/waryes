import { Router } from '@vaadin/router';
import '@vaadin/vaadin-lumo-styles';
import { color } from '@vaadin/vaadin-lumo-styles';

const $tpl1 = document.createElement('template');
$tpl1.innerHTML = `<style>${color.toString().replace(':host', 'html')}</style>`;
document.head.appendChild($tpl1.content);

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