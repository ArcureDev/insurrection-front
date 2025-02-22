import {Component, computed, input, Signal} from '@angular/core';
import {TokenComponent} from './token/token.component';
import {KeyValuePipe} from '@angular/common';
import {Game, Player, TokenType} from '../../app/types';
import {isLight, getNbTokensByPlayersIds} from '../../app/utils/utils';

@Component({
  selector: 'ins-default-tokens',
  imports: [TokenComponent, KeyValuePipe],
  templateUrl: './default-tokens.component.html',
  styleUrl: './default-tokens.component.scss',
})
export class DefaultTokensComponent {
  game = input.required<Game>()
  player = input.required<Player>()
  players = input.required<Player[]>()
  type = input.required<TokenType>()

  playersByPlayersIds: Signal<Map<number, Player>> = computed(() => {
    return this.players().reduce((acc, player) => {
      acc.set(player.id, player)
      return acc
    }, new Map<number, Player>)
  })

  nbInfluenceTokensByPlayersIds = computed(() => {
    const game = this.game();
    const player = this.player()
    if (!game || !player) return;
    return getNbTokensByPlayersIds(game, player, 'INFLUENCE')
  })

  nbShardTokensByPlayersIds = computed(() => {
    const game = this.game();
    const player = this.player()
    if (!game || !player) return;
    return getNbTokensByPlayersIds(game, player, 'SHARD')
  })

  protected readonly isLight = isLight;
}
