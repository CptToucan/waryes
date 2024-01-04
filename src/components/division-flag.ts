import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import ICON_UK_1_ARM from '../../images/divisions/1st-armor.png';
import ICON_UK_2_INF from '../../images/divisions/2nd-inf.png';
import ICON_RFA_2_PZ from '../../images/divisions/2pz.png';
import ICON_US_3_ARM from '../../images/divisions/3rd-armor.png';
import ICON_DDR_4_MOT from '../../images/divisions/4mot.png';
import ICON_FRA_5_E from '../../images/divisions/5e.png';
import ICON_RFA_5_PZ from '../../images/divisions/5pz.png';
import ICON_DDR_7_MOT from '../../images/divisions/7mot.png';
import ICON_US_8_INF from '../../images/divisions/8th-inf.png';
import ICON_FRA_11_E from '../../images/divisions/11e.png';
import ICON_SOV_35_YA from '../../images/divisions/35ya.png';
import ICON_SOV_39_YA from '../../images/divisions/39ya.png';
import ICON_SOV_79_YA from '../../images/divisions/79ya.png';
import ICON_US_82_AB from '../../images/divisions/82nd.png';
import ICON_NATO_BER_CMD from '../../images/divisions/berlin-cmd.png';
import ICON_RDA_KDA from '../../images/divisions/kda.png';
import ICON_RFA_TKS from '../../images/divisions/tks.png';
import ICON_DDR_UZ from '../../images/divisions/unt-zen.png';
import ICON_SOV_119 from '../../images/divisions/119-ya.png';
import ICON_US_11ACR from '../../images/divisions/11-acr.png';
import ICON_US_24INF from '../../images/divisions/24-inf.png';
import ICON_SOV_27_YA from '../../images/divisions/27-ya.png';


import { Division } from '../types/deck-builder';
import { getDescriptorWithoutMod } from '../utils/get-descriptor-without-mod';

const ICONS_DIVISION_MAP: {[key: string]: any} = {
    'Descriptor_Deck_Division_RDA_7_Panzer_multi': ICON_DDR_7_MOT,
    'Descriptor_Deck_Division_RFA_5_Panzer_multi': ICON_RFA_5_PZ,
    'Descriptor_Deck_Division_SOV_79_Gds_Tank_multi': ICON_SOV_79_YA,
    'Descriptor_Deck_Division_US_3rd_Arm_multi': ICON_US_3_ARM,
    'Descriptor_Deck_Division_US_8th_Inf_multi': ICON_US_8_INF,
    'Descriptor_Deck_Division_NATO_Garnison_Berlin_multi': ICON_NATO_BER_CMD,
    'Descriptor_Deck_Division_SOV_39_Gds_Rifle_multi': ICON_SOV_39_YA,
    'Descriptor_Deck_Division_RDA_4_MSD_multi': ICON_DDR_4_MOT,
    'Descriptor_Deck_Division_RFA_2_PzGrenadier_multi': ICON_RFA_2_PZ,
    'Descriptor_Deck_Division_SOV_35_AirAslt_Brig_multi': ICON_SOV_35_YA,
    'Descriptor_Deck_Division_US_82nd_Airborne_multi': ICON_US_82_AB,
    'Descriptor_Deck_Division_FR_11e_Para_multi': ICON_FRA_11_E,
    'Descriptor_Deck_Division_FR_5e_Blindee_multi': ICON_FRA_5_E,
    'Descriptor_Deck_Division_RDA_KdA_Bezirk_Erfurt_multi': ICON_RDA_KDA,
    'Descriptor_Deck_Division_RFA_TerrKdo_Sud_multi': ICON_RFA_TKS,
    'Descriptor_Deck_Division_UK_1st_Armoured_multi': ICON_UK_1_ARM,
    'Descriptor_Deck_Division_UK_2nd_Infantry_multi': ICON_UK_2_INF,
    'Descriptor_Deck_Division_WP_Unternehmen_Zentrum_multi': ICON_DDR_UZ,
    'Descriptor_Deck_Division_SOV_119IndTkBrig_multi': ICON_SOV_119,
    'Descriptor_Deck_Division_US_11ACR_multi': ICON_US_11ACR,
    'Descriptor_Deck_Division_US_24th_Inf_multi': ICON_US_24INF,
    'Descriptor_Deck_Division_SOV_27_Gds_Rifle_multi': ICON_SOV_27_YA,

}

@customElement('division-flag')
export class DivisionFlag extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      img {
        width: 100%
      }
    `;
  }

  @property()
  division?: Division

  @property()
  divisionId?: string

  render(): TemplateResult {
    let icon;
    let displayName;
    if (this.divisionId) {
      const divisionId = getDescriptorWithoutMod(this.divisionId);
      icon = ICONS_DIVISION_MAP[divisionId];
      displayName = divisionId;
    }

    if(this.division) {
      const divisionDescriptor = getDescriptorWithoutMod(this.division.descriptor);
      icon = divisionDescriptor ? ICONS_DIVISION_MAP[divisionDescriptor] : '';
      displayName = this.division?.name ?? this.division?.descriptor ?? 'invalid division'
    }

    return html`<img src=${icon} alt=${ displayName } title=${displayName} />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'division-flag': DivisionFlag;
  }
}
