import {Component, input} from '@angular/core';
import {ButtonComponent} from '../../../atomic-design/button/button.component';
import {Player, TokenType} from '../../types';
import {DefaultTokensComponent} from '../../../atomic-design/tokens/default-tokens.component';
import {PATH_GAME, PATH_PLAYER} from '../../app.routes';

@Component({
  selector: 'ins-game-player-buttons',
  imports: [
    ButtonComponent,
    DefaultTokensComponent,
  ],
  templateUrl: './game-player-buttons.component.html',
  styleUrl: './game-player-buttons.component.scss'
})
export class GamePlayerButtonsComponent {

  isStreamerMode = input.required<boolean>();
  player = input.required<Player>();
  gameId = input.required<number>();

  copyUrl(type: TokenType) {
    navigator.clipboard.writeText(`${window.origin}/${PATH_GAME}/${this.gameId()}/${PATH_PLAYER}/${this.player().id}?type=${type}`);
  }
}
