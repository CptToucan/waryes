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
          .markdown=${`## A superior guide on how to successfully read a map
### Introduction
^^tooltip test
Welcome to the comprehensive guide on mastering the art of reading game maps in Warno! As a seasoned nerd, you likely understand that comprehensive knowledge of the map is crucial for achieving victory reliably. In this guide, we will delve into the key elements that will enhance your map-reading skills and help you navigate through the mosh pit of fun, asymmetrical, and sometimes unbalanced 1v1 maps in Warno. When analyzing a map in Warno, one must grasp four key fundamentals: 
 
 - Zone layout
 - Chokepoints
 - Reinforcement lanes
 - Checkpoints

By understanding these four elements, you will have the necessary tools to determine where to strategically deploy your division's strength and which areas are not worth investing in. 

This guide will use the map Loop to showcase the different fundamentals and how they should be applied. I have chosen loop since it is a map with many chokepoints through town and bridge placement and clear reinforcement lanes. The knowledge you will gain through this guide with the map analysis of Loop is directly applicable to other 1v1 maps too. Match-ups and division played will also affect how we interpret and implement these fundamentals. As we can see from the map and in game pictures below, Loop consists of 9 zones with a standard layout of the zones that most 1v1 maps adhere to. The three contested zones are strategically designed to converge near the midpoint between the red and blue spawn points so both sides will arrive at the zones almost simultaneously. Some quirks will be addressed later in this guide about arrival times in the different zones.
![Loop_Overview_3](https://i.imgur.com/ejf46LS.png)
![Loop_Overview_1](https://i.imgur.com/Z5cTHIU.jpg)
![Loop_Overview_2](https://i.imgur.com/Rj0zdoT.jpg)
### 1. Fundamentals
#### 1.1 Zone Layout



Let's explore the layout of the map. Each zone within the game possesses a unique configuration of terrain, structures, and objectives. Familiarizing yourself with the zone layout enables you to navigate the zones efficiently, capitalize on advantageous positions, and anticipate potential threats. By understanding the flow of the map and the interconnectivity between zones, you can devise strategies that maximize your chance of victory. With Loop's standard spread of the zones in a "Blue side - Neutral - Red side" placement, most of the fighting will happen in the neutral zones. The neutral zones can usually be split down the "mathematical middle" or through specific dividing features inside the zones. As we can see by the image beneath, the center zone of Loop has a road going through it that looks like its natural dividing feature.
![## Loop_Neutral_Zone_Center_1](https://i.imgur.com/3R3nuye.png) 
Next, you might think that each player just takes a side of the area, like the picture below shows. But this way of splitting the area isn't great. It doesn't help much to control some of the buildings in a group, but not all. Why? Because it's really hard to keep control of buildings that your enemy can get to easily by moving soldiers through their own buildings. Also, you won't see what's coming to try and take you out of the buildings until it's right on top of you. So, how do we figure out who gets what side of the zone?
![Loop_Neutral_Zone_Center_2](https://i.imgur.com/kuOlNF3.png)
The simple answer is to look at what "belongs together" and who can most easily access those clusters of buildings and use them to control the nearby area. The picture below showcases which buildings "belong together" in the center zone of Loop. Each building cluster can be held with relatively low effort without holding the others. Still, they are incredibly difficult to defend if you allow your opponent to access the cluster you are currently inside, as it then turns into a brawl. These six building clusters, together with the forested areas in between them, makes up the valuable area inside the zone because they are the key to controlling the zone. But who has the advantage in controlling the different building clusters? 
![Loop_Neutral_Zone_Center_3](https://i.imgur.com/QCzf6MZ.png)
To address that, we need to take into account the zone's topography. Though not immediately evident from the pictures, a large portion of the zone is essentially a recessed plateau. With the aid of the Line of Sight (LOS) tool (in-game hotkey "C"), it becomes apparent that the black and pink clusters sit atop a ridge, while the remaining clusters occupy the plateau's sunken area. As depicted in the subsequent image, this ridge functions as an effective line-of-sight barrier, forming a distinct division within the zone.

This particular layout grants the red side better control over the blue, green, yellow, and red building clusters. Conversely, it presents an advantage to the blue side in terms of controlling the black and pink building cluster. These advantages stem from factors such as ease of reinforcement, difficulty of being driven out from a designated area, availability of easy retreat options, and who gets to various parts of the zone first in the opening stage.![enter image description here](https://i.imgur.com/8nqrHMG.png)  
![enter image description here](https://i.imgur.com/TDz9fGI.png)
Advantages in one zone can also translate to a general map advantage. The zone layout on Loop considerably favors the red side. Their inherent upper hand in the central zone also offers them convenient access to the bridges leading to the side zones.  Those with a sharp eye may have observed that the map's town elements within the "neutral" zones are nearer to the red than the blue side. This imbalance in map design further tips the scales in favor of the red side. It allows the red forces to reach the towns on both the left and right side quicker than their blue counterparts if all else is equal (forward deploy, speed, etc). In essence that means that controlling the building clusters inside the red part of the central zone is crucial for the overall map control.
![enter image description here](https://i.imgur.com/KvejX5h.png)

#### 1.2 Chokepoints

Chokepoints are key narrow areas on the map that dictate the movement patterns for both teams. Identifying these vital locations enables you to predict enemy strategies and make well-informed choices about defense or exploitation. Awareness of chokepoint locations offers a tactical edge, allowing you to steer the course of conflict and secure important objectives and positions.

As depicted in the image below, three red circles are located on roads – the fastest movement paths within the game. Dominating these particular sections of the road with proper anti-tank resources such as infantry, tanks, or ATGMs, impedes your adversary's capacity to quickly shift their forces to other objectives across the map. In Loop, the marked road sections serve as the speediest routes to other zones. The two circles near the bridges act as gateways to the side zones, while all three offer entry to the central backline zone. By controlling one or more of these chokepoints, you can limit your opponent's freedom to traverse different zones, effectively guiding their movements.
![Loop_Chokepoints_Center_1](https://i.imgur.com/B7IC5Un.png)
Even though it's feasible to traverse the central zone without ruling the three chokepoints, it will likely be a slow and potentially costly process due to exposure to attacks. At this point, you're not merely crossing the zone, but possibly launching an attack on your rival's positions. This underlines the crucial significance of chokepoints, presenting your opponent with three alternatives:

1.  Launch an attack on your position
2.  Embark on a risky and/or slow trek through hostile territory
3.  Stay in their current location

Maximizing the use of chokepoints requires units capable of ambushing vehicles or dealing with them at extended ranges. Certain chokepoints also demand robust anti-infantry capabilities, like machine gun squads or efficient infantry units. A chokepoint serves as a means to limit enemy movement and inflict substantial damage to an attacking force by concentrating firepower. If you lack fire superiority that can be utilized from the chokepoint, it's possible to let your opponent reach the chokepoint, and then annihilate the now clustered units making their way through.

#### 1.3 Reinforcement Lanes
Reinforcement lanes play a pivotal role in dictating the pace and outcome of battles. These lanes are designated routes that allow for the arrival of reinforcements from one area of the map to another. By identifying and utilizing reinforcement lanes effectively, you can maintain a strong presence across multiple fronts and outmaneuver your opponents. 

Reinforcement always start their journey at the spawn points. Spawn points are always at the outer edges of the map, and is highlighted with blue/red zone on the map without victory points in them (there are some capturable spawn points on some maps that grants victory points). Spawn points are also always tied to a road going through the zone, which can be seen by the yellow arrows on the picture beneath, and units called in will move as fast as possible from the spawn location to where you ordered it. 

![enter image description here](https://i.imgur.com/kHO3lI4.png) 

The positioning of a unit call-in is crucial as it determines where the unit will spawn and the route it will take to its assigned area. Since units by default choose the fastest route, their movements can be anticipated and exploited. One of the most cost-effective tactics in the game involves stealthily navigating the map and placing a tank, a recon vehicle with an auto-cannon (AC), or infantry with effective AT weaponry to ambush unsuspecting reinforcements speeding down roads. This tactic doesn't work everywhere; successful ambushes require:

1.  Enough distance to stay concealed until they fire
2.  An attack angle, preferably rear armor but at least side armor shots
3.  A cover, either in forest or buildings

![enter image description here](https://i.imgur.com/e9qDDon.png)

The image above illustrates a good path (red arrows) and position (green circle) for a reinforcement lane ambush targeting forces moving to a neutral zone. The advantages of these ambushes are their relative stealth and suitability for infantry with potent AT weapons. They offer high damage potential at a minimal cost, as low as 60pts with a transport. Besides the damage inflicted through kills, your adversary also has to expend micro and allocate resources to handle your incursion into their lines (if they notice).

Controlling or pressuring enemy reinforcement lanes will afford you a speed advantage in deploying reinforcements into neutral zones. Your opponent will have to either fight off your force challenging their reinforcement route, send their units in a less optimal way, or risk fast movement through a contested zone. This pressure might lead your opponent to completely forfeit the zone in favor of allocating their resources elsewhere on the map.

Applying pressure on reinforcement lanes is likely to provoke an overreaction from your opponent, with them overspending resources to eliminate the perceived threat. You will then need to decide whether to confront this force or, knowing an overreaction is likely, allocate your own resources to assault the objective with its reinforcement lane under threat or strike another part of the map hard, predicting where your opponent is likely to assign resources.

#### 1.4 Checkpoints
Checkpoints should not be confused with chokepoints, even though they often overlap in practice. Checkpoints is what you need to control in order to effectively continue a controlled push forwards. Simplified it can be viewed as taking "my zone" first, then take the neutral zone, and finally take "their zone". There is however more depth to this, with every map having lots of mini checkpoints that you need to seize before moving on.
![enter image description here](https://i.imgur.com/e9qDDon.png)

The example from the section about attacking reinforcement lanes are perfect for this exercise. Since the example was about setting an ambush you could just sneak the units into enemy territory without caring about a "secure" reinforcement road for those units. When we think in terms of checkpoint play it is all about securing those reinforcement lanes so you never get cut off. The green circles illustrate where you need "holding forces". These spots need to be secured, so you can advance to the next positions with an option to retreat without being cut off. They are also crucial for keeping the supply and reinforcement lines open. Anything outside of the red lines is to be considered enemy territory, and should be treated as such, but is also of little value to attack straight away. The first checkpoint that needs to be established to take advantage of the south side reinforc
![enter image description here](https://i.imgur.com/9rz0EHZ.png)

![enter image description here](https://i.imgur.com/GU29q4S.png)

![enter image description here](https://i.imgur.com/l9jvXrO.png)`
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
