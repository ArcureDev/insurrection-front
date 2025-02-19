import {Component, input} from '@angular/core';
import {ButtonComponent} from '../../../atomic-design/button/button.component';
import {Player, TokenType} from '../../types';
import {DefaultTokensComponent} from '../../../atomic-design/tokens/default-tokens.component';

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

  copyUrl(type: TokenType) {
    navigator.clipboard.writeText(`${window.origin}/players/${this.player().id}?type=${type}`);
  }
}
