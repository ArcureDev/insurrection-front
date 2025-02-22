import {
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  resource,
  signal,
  Signal,
  viewChild
} from '@angular/core';
import {TokenComponent} from './token/token.component';
import {KeyValuePipe} from '@angular/common';
import {Game, Player, TokenType} from '../../app/types';
import {getNbTokensByPlayersIds, isLight} from '../../app/utils/utils';
import {api, HttpService} from '../../app/http.service';
import {ButtonComponent} from '../button/button.component';
import {WithoutMyPlayerPipe} from '../../app/game-details/without-my-player.pipe';

@Component({
  selector: 'ins-default-tokens',
  imports: [TokenComponent, KeyValuePipe, ButtonComponent, WithoutMyPlayerPipe],
  templateUrl: './default-tokens.component.html',
  styleUrl: './default-tokens.component.scss',
})
export class DefaultTokensComponent {
  game = input.required<Game>()
  player = input.required<Player>()
  players = input.required<Player[]>()
  type = input.required<TokenType>()
  myPlayer = input.required<Player>()

  giveMyTokenElementRef = viewChild<ElementRef<HTMLDialogElement>>('giveMyTokenElementRef')
  giveTokenElementRef = viewChild<ElementRef<HTMLDialogElement>>('giveTokenElementRef')

  private readonly injector = inject(Injector)
  private readonly httpService = inject(HttpService)

  playerToto = signal<Player | undefined>(undefined)
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

  giveToken(playerId: number) {
    resource({
      loader: async () => {
        await this.httpService.sweetFetchWithNoReturn<Game>(
          api(`games/${this.game()?.id}/players/${playerId}/tokens`),
          'POST',
        );
        this.giveTokenElementRef()?.nativeElement.close()
        this.playerToto.set(undefined)
      },
      injector: this.injector,
    });
  }

  giveMyToken(playerId: number) {
    resource({
      loader: async () => {
        await this.httpService.sweetFetchWithNoReturn<Game>(
          api(`games/${this.game()?.id}/players/${playerId}/tokens/me`),
          'POST',
        );
        this.giveMyTokenElementRef()?.nativeElement.close()
      },
      injector: this.injector,
    });
  }

  openModal(isMe: boolean, player: Player) {
    if (this.myPlayer().id !== this.player().id) return
    if (isMe) {
      this.giveMyTokenElementRef()?.nativeElement.showModal()
      return
    }
    this.playerToto.set(player);
    this.giveTokenElementRef()?.nativeElement.showModal()
  }
}
