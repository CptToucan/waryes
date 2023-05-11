// import '@vaadin/vaadin-lumo-styles';
import { color } from '@vaadin/vaadin-lumo-styles';

const $tpl1 = document.createElement('template');
$tpl1.innerHTML = `<style>${color.toString().replace(':host', 'html')}</style>`;
document.head.appendChild($tpl1.content);

import "./iconset.js";

import "./services/router";

/** Routes */
import "./routes/application";
import "./routes/index";
import "./routes/register";
import "./routes/login";
import "./routes/units";
import "./routes/unit-view";
import "./routes/comparison"
import "./routes/deck-builder"
import "./routes/deck-import";
import "./routes/deck-library";
import "./routes/deck-view";
import "./routes/forgot-password";
import "./routes/privacy-policy";
import "./routes/user-settings";
import "./routes/my-decks";
import "./routes/patch-notes";

/** Components */
import "./components/unit-card";
import "../styles/app.css";
