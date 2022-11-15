// import '@vaadin/vaadin-lumo-styles';
import { color } from '@vaadin/vaadin-lumo-styles';

const $tpl1 = document.createElement('template');
$tpl1.innerHTML = `<style>${color.toString().replace(':host', 'html')}</style>`;
document.head.appendChild($tpl1.content);

import "./services/router";

/** Routes */
import "./routes/application";
import "./routes/index";
import "./routes/register";
import "./routes/login";
import "./routes/units";
import "./routes/unit-view";
import "./routes/comparison"

/** Components */
import "./components/unit-card";
import "../styles/app.css";
