import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  resource,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {DefaultComponent} from '../abstract-default.component';
import {Game, Player} from '../types';
import {api} from '../http.service';
import {CardComponent} from '../../atomic-design/card/card.component';
import {ButtonComponent} from '../../atomic-design/button/button.component';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {authenticatedRoute, PATH_USER, route} from '../app.routes';
import {InputComponent} from '../../atomic-design/input/input.component';
import {notBlankValidator} from '../utils/validator.utils';
import {ContainerComponent} from '../../atomic-design/container/container.component';
import {WithoutMyPlayerPipe} from '../game-details/without-my-player.pipe';
import {GamePlayerButtonsComponent} from './player-buttons/game-player-buttons.component';
import {GameRolePickerComponent} from './game-role-picker/game-role-picker.component';

@Component({
  selector: 'ins-game',
  imports: [
    CardComponent,
    ButtonComponent,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    ContainerComponent,
    FormsModule,
    WithoutMyPlayerPipe,
    GamePlayerButtonsComponent,
    GameRolePickerComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent extends DefaultComponent {
  dealTokensDialog = viewChild<ElementRef<HTMLDialogElement>>('dealTokensDialog');
  changeColorDialog = viewChild<ElementRef<HTMLDialogElement>>('changeColorDialog');
  quitGameDialog = viewChild<ElementRef<HTMLDialogElement>>('quitGameDialog');
  closeGameDialog = viewChild<ElementRef<HTMLDialogElement>>('closeGameDialog');

  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly formBuilder = inject(FormBuilder);

  changeColorForm = this.formBuilder.nonNullable.group({
    color: this.formBuilder.nonNullable.control<string | undefined>(undefined, [
      Validators.required,
      notBlankValidator,
    ]),
  });

  game = computed(() => this.httpService.currentGame());
  myPlayer = signal<Player | undefined>(undefined);
  isStreamerMode = signal(false);
  isPickingRole= signal(false);

  protected readonly authenticatedRoute = authenticatedRoute;

  constructor() {
    super();
    effect(() => {
      const game = this.game();
      if (!game) return;
      untracked(() => {
        this.myPlayer.set(game.players.find((player) => player.me));
        this.changeColorForm.controls.color.setValue(this.myPlayer()?.color);
      });
    });
  }

  copyUrl() {
    navigator.clipboard.writeText(
      this.game()?.url ?? "LA GAME N'EXISTE PAS D:",
    );
  }

  closeGame() {
    if (!this.game()) return;
    resource({
      loader: async () => {
        fetch(api(`games/${this.game()?.id}`), {
          method: 'DELETE',
        }).then(() => {
          this.closeGameDialog()?.nativeElement.close();
          this.httpService.currentGame.set(undefined);
          this.router.navigate([PATH_USER]);
        });
      },
      injector: this.injector,
    });
  }

  dealTokens() {
    if (!this.game()) return;
    resource({
      loader: async () => {
        const game = await this.httpService.sweetFetch<Game, void>(
          api(`games/${this.game()?.id}/tokens`),
        );
        this.httpService.currentGame.set(game);
        this.dealTokensDialog()?.nativeElement.close();
      },
      injector: this.injector,
    });
  }

  changeColor() {
    const color = this.changeColorForm.getRawValue().color;
    if (this.changeColorForm.invalid || !color) {
      return;
    }

    resource({
      loader: async () => {
        await this.httpService.sweetFetch<void, string>(
          api(`games/${this.game()?.id}/players/color`),
          'POST',
          color,
        );
        this.changeColorDialog()?.nativeElement.close();
      },
      injector: this.injector,
    });
  }

  quitGame() {
    resource({
      loader: async () => {
        await this.httpService.sweetFetchWithNoReturn<void>(
          api(`games/${this.game()?.id}/players`),
          'DELETE'
        );
        this.httpService.currentGame.set(undefined);
        this.quitGameDialog()?.nativeElement.close();
        this.router.navigate([route(PATH_USER)]);
      },
      injector: this.injector,
    });
  }

  getRoles() {
    const gameId = this.game()?.id;
    if (!gameId) return;
    resource({
      loader: async () => {
        await this.httpService.sweetFetch(`/api/games/${gameId}/roles`);
      },
      injector: this.injector,
    });
  }
}
