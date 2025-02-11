import {Component, input} from '@angular/core';
import {ButtonComponent} from '../../../atomic-design/button/button.component';
import {Player, PlayerPayload} from '../../types';
import {InfluenceTokensComponent} from '../../../atomic-design/tokens/influences/influence-tokens.component';
import {ShardTokensComponent} from '../../../atomic-design/tokens/shards/shard-tokens.component';

@Component({
  selector: 'ins-game-player-buttons',
  imports: [
    ButtonComponent,
    InfluenceTokensComponent,
    ShardTokensComponent
  ],
  templateUrl: './game-player-buttons.component.html',
  styleUrl: './game-player-buttons.component.scss'
})
export class GamePlayerButtonsComponent {

  isStreamerMode = input.required<boolean>();
  player = input.required<Player>();


  copyUrl() {
    //TODO
  }
}
