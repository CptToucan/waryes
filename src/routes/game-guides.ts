import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../components/markdown-renderer';

@customElement('game-guides-route')
export class GameGuidesRoute extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: var(--lumo-space-s);
        gap: var(--lumo-space-m);
        position: relative;
        margin-left: auto;
        margin-right: auto;
        max-width: 1000px;
      }

      
    `;
  }

  render(): TemplateResult {
    return html`
      <content-panel>
        <markdown-renderer
          .markdown=${`## !DRAFT WORK!
## A superior guide on how to successfully read a map
### Introduction
Welcome to the comprehensive guide on mastering the art of reading game maps in Warno! As a seasoned nerd, you likely understand that comprehensive knowledge of the map is crucial for achieving victory reliably.
In this guide, we will delve into the key elements that will enhance your map-reading skills and help you navigate through the mosh pit of fun, asymmetrical, and sometimes unbalanced 1v1 maps in Warno.
When analyzing a map in Warno, one must grasp four key fundamentals:
- Chokepoints 
- Reinforcement lanes
- Checkpoints
- Zone layout

By understanding these four elements, you will have the necessary tools to determine where to strategically deploy your division's strength and which areas are not worth investing in. 

This guide will use the map Loop to showcase the different fundamentals and how they should be applied. I have chosen loop since it is a map with many chokepoints through town and bridge placement, and clear reinforcement lanes. The knowledge you will gain through this guide with the map analysis of Loop is directly applicable to other 1v1 maps too. Match-ups and division played will also affect how we interpret and implement these fundamentals. As we can see from the map and in game pictures below, Loop consists of 9 zones with a standard layout of the zones that most 1v1 maps adhere to. The three contested zones are strategically designed to converge near the midpoint between the red and blue spawn points so both sides will arrive at the zones almost simultaneously. Some quirks will be addressed later in this guide about arrival times in the different zones.


![Loop_Overview_3](https://i.imgur.com/ejf46LS.png)
![Loop_Overview_1](https://i.imgur.com/Z5cTHIU.jpg)
![Loop_Overview_2](https://i.imgur.com/Rj0zdoT.jpg)

### 1. Fundamentals
#### 1.1 Zone layout
Let's explore the layout of the map. Each zone within the game possesses a unique configuration of terrain, structures, and objectives. Familiarizing yourself with the zone layout enables you to navigate the zones efficiently, capitalize on advantageous positions, and anticipate potential threats. By understanding the flow of the map and the interconnectivity between zones, you can devise strategies that maximize your chance of victory. With Loop's standard spread of the zones in a "Blue side - Neutral - Red side" placement.
#### 1.2 Chokepoints
Chokepoints are strategic bottlenecks on the map that control the flow of movement for both teams. By recognizing these crucial areas, you can anticipate enemy movements and make informed decisions about defending or exploiting them. Knowing where chokepoints exist provides a strategic advantage, allowing you to manipulate the flow of battle and gain control over key objectives and positions.

In the picture beneath there are three red circles. Those are placed on top of roads because using roads is the fastest way to move in the game. Having control of these pieces of the road with proper anti-tank (AT) capabilities, either through infantry, tanks, or ATGMs, blocks your opponent's ability to quickly move its forces to other objectives on the map. In the case of Loop, the three bits of roads marked are all the fastest routes to move on to the other zones. The two circles closest to the bridges are the access points for the side zones, and all three are access points for the backline center zone. Holding one or more of these chokepoints will limit your opponent's opportunity to move between the different zones, allowing you to dictate their movements. 
![Loop_Chokepoints_Center_1](https://i.imgur.com/B7IC5Un.png)

Missing:
- Showing the restricted movement
- How to exploit control over a chokepoint
- Which chokepoints are offensively orientated and which are defensive orientated
- Supporting pictures/drawings

#### 1.3 Reinforcement lanes
Reinforcement lanes play a pivotal role in dictating the pace and outcome of battles. These lanes are designated routes that allow for the arrival of reinforcements from one area of the map to another. By identifying and utilizing reinforcement lanes effectively, you can maintain a strong presence across multiple fronts, outmaneuver your opponents, and secure victory. 
#### 1.4 Checkpoints
Checkpoints should not be confused with chokepoints, even though they often overlap in practice. 
### 2. Applying the four fundamentals

## DRAFT WORK

**


Lastly, we will delve into what makes certain map areas high value. These areas typically offer significant advantages, such as control over critical objectives and/or better defensive positions. Recognizing high-value areas allows you to prioritize your focus, allocate resources effectively, and apply pressure where it matters most. By dominating these areas, you can establish a firm foothold and exert influence throughout the game.
`
}
        ></markdown-renderer>
      </content-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-guides-route': GameGuidesRoute;
  }
}
