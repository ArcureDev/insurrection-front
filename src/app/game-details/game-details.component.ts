import {Component, computed, effect, inject, Injector, resource, signal, untracked,} from '@angular/core';
import {DefaultComponent} from '../abstract-default.component';
import {FlagColor, Game, Player} from '../types';
import {TokenComponent} from '../../atomic-design/tokens/token/token.component';
import {ButtonComponent} from '../../atomic-design/button/button.component';
import {api} from '../http.service';
import {FlagComponent} from '../../atomic-design/flag/flag.component';
import {DefaultTokensComponent} from '../../atomic-design/tokens/default-tokens.component';
import {CardComponent} from '../../atomic-design/card/card.component';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'ins-game-details',
  imports: [
    TokenComponent,
    ButtonComponent,
    FlagComponent,
    DefaultTokensComponent,
    CardComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './game-details.component.html',
  styleUrl: './game-details.component.scss',
})
export class GameDetailsComponent extends DefaultComponent {
  private readonly injector = inject(Injector);

  game = computed(() => this.httpService.currentGame())

  nbRedFlags = signal<number>(0);
  nbBlackFlags = signal<number>(0);

  myPlayer = computed(() => this.game()?.players.find((player) => player.me))
  canGiveShardToken = computed(() => {
    const myPlayerId = this.myPlayer()?.id
    if (!myPlayerId) return false;
    const myPlayer = this.game()?.players.find(it => it.id === myPlayerId)
    if (!myPlayer) return false;
    return myPlayer.playableTokens.some((token) => token.type === 'SHARD')
  });

  constructor() {
    super();
    effect(() => {
      const game = this.game();
      if (!game) return;
      untracked(() => this.init(game))
    });
  }

  private init(game: Game) {
    console.log('hihih', game)
    this.nbRedFlags.set(
      game.flags.filter((flag) => flag.color === 'RED').length,
    );
    this.nbBlackFlags.set(
      game.flags.filter((flag) => flag.color === 'BLACK').length,
    );
  }

  giveToken(player: Player) {
    resource({
      loader: async () => {
        const game = await this.httpService.sweetFetch<Game, void>(
          api(`games/${this.game()?.id}/players/${player.id}/tokens`),
          'POST',
        );
        this.httpService.currentGame.set(game);
        return game;
      },
      injector: this.injector,
    });
  }

  giveShardToken() {
    resource({
      loader: async () => {
        return this.httpService.sweetFetch<Game, void>(
          api(`games/${this.game()?.id}/tokens`),
          'POST',
        );
      },
      injector: this.injector,
    });
  }

  addShardToken() {
    resource({
      loader: async () => {
        return this.httpService.sweetFetch<Game, void>(
          api(`games/${this.game()?.id}/tokens/add`),
          'POST',
        );
      },
      injector: this.injector,
    });
  }

  addFlag(flagColor: FlagColor) {
    resource({
      loader: async () => {
        return this.httpService.sweetFetch<Game, FlagColor>(
          api(`games/${this.game()?.id}/flags`),
          'POST',
          flagColor,
        );
      },
      injector: this.injector,
    });
  }

  addVote() {
    resource({
      loader: async () => {
        return this.httpService.sweetFetch<void, void>(
          api(`games/me/votes`),
          'POST',
        );
      },
      injector: this.injector,
    });
  }

  resetVotes() {
    resource({
      loader: async () => {
        return this.httpService.sweetFetch<void, void>(
          api(`games/me/votes`),
          'DELETE',
        );
      },
      injector: this.injector,
    });
  }
}
