import {Component, computed, effect, inject, input, signal, untracked} from '@angular/core';
import {HttpService} from '../../../app/http.service';
import {Player, Token, TokenType} from '../../../app/types';
import {ActivatedRoute} from '@angular/router';
import {isNotNullOrUndefined} from '../../../app/utils/object.utils';
import {DefaultTokensComponent} from '../../tokens/default-tokens.component';

@Component({
  selector: 'ins-overlay-tokens',
  imports: [
    DefaultTokensComponent
  ],
  templateUrl: './overlay-tokens.component.html',
  styleUrl: './overlay-tokens.component.scss'
})
export class OverlayTokensComponent {

  gameId = input(undefined, {
    transform: (it: number | undefined) => (isNotNullOrUndefined(it) ? Number(it) : undefined)
  });
  playerId = input(undefined, {
    transform: (it: number | undefined) => (isNotNullOrUndefined(it) ? Number(it) : undefined)
  });

  private readonly router = inject(ActivatedRoute);
  private readonly httpService = inject(HttpService);

  player = signal<Player | undefined>(undefined);
  type = signal<TokenType | undefined>(undefined);
  game = computed(() => this.httpService.currentGame())

  constructor() {
    this.router.queryParams.subscribe(params => {
      this.type.set(params['type'])
    })

    effect(() => {
      const gameId = this.gameId()
      if (!gameId) return

      this.httpService.syncGame(gameId)
      this.httpService.subscribeToGameUpdates(gameId)
    });

    effect(() => {
      const game = this.game()
      const playerId = this.playerId();
      untracked(() => {
        const currPlayer = game?.players.find(it => it.id === playerId)
        if (!currPlayer) return;
        this.player.set(currPlayer)
      })
    });
  }

}
