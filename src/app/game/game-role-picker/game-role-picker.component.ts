import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector, input,
  signal, untracked,
  viewChild
} from '@angular/core';
import {Player, PlayerRole, playerRoles} from '../../types';
import {ReactiveFormsModule} from '@angular/forms';
import {fromEvent} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ButtonComponent} from '../../../atomic-design/button/button.component';
import {HttpService} from '../../http.service';

const descriptionByRole: Record<PlayerRole, string> = {
  'ECHO': 'À l\'époque moderne, on vous appelle le quatrième pouvoir. Mais la réalité, c\'est que\n' +
    'vous avez toujours été là. Ceux qui commentent, ceux qui informent. Les révolutions,\n' +
    'c\'est vous qui les déclenchez en nourrissant la colère du peuple comme on donne\n' +
    'des bûches à un brasier. Et pourtant, c\'est aussi vous qu\'on retrouve à faire des\n' +
    'courbettes aux puissants. Ça va, ça tire pas trop le grand écart ?',
  'ECUSSON': 'Tu travaillais pour l\'Ordre, ou le Pouvoir, ou peut-être même pour l\'Écho.\n' +
    'En tout cas, tu étais ce qu\'on pourrait appeler un maillon du système.\n' +
    'Probablement pas le plus petit, d\'ailleurs. Mais les choses ont changé. Tu\n' +
    'sens bien que tu es devenu un corps\n' +
    'étranger dans l\'organisme, et que le\n' +
    'système immunitaire ne va pas tarder à te rattraper si tu ne fais pas\n' +
    'preuve d\'une grande habileté...',
  'ETOILE': 'Tu n\'es pas entrée dans l\'arène il y a\n' +
    'très longtemps, mais tu fais déjà des\n' +
    'étincelles. Bien sûr, tu as des idées, des\n' +
    'convictions. Bien entendu tu sais quelle\n' +
    'cause tu défends. Mais tu la défendras\n' +
    'mieux depuis le haut de la pyramide,\n' +
    'non? Et s\'il faut faire quelques compromis pour y arriver ? Peut-être que le jeu\n' +
    'en vaut la chandelle, après tout ?',
  'ORDRE': 'Si tout le monde se comportait de façon citoyenne, il n\'y aurait pas de problème.\n' +
    'Mais voilà, y\'a toujours des petits malins pour se croire tout permis. Alors faut\n' +
    'les rappeler à l\'ordre ; de façon musclée si nécessaire. Et devant les autres des\n' +
    'fois que ça leur donnerait des idées. ',
  'MOLOTOV': 'Les grands discours, ça n\'a jamais\n' +
    'déboulonné aucune statue ou arrêté\n' +
    'la moindre charge. Tu ne vis pas dans\n' +
    'un roman, tu te confrontes au réel.\n' +
    'Et tu y vas préparé·e, quitte à jouer\n' +
    'les épouvantails et te faire des ennemis jusque dans ton propre camp.\n' +
    'Pourtant, pas de doute, tu es efficace\n' +
    'pour démonter. Oui, mais quand il\n' +
    'faudra reconstruire ?',
  'PAMPHLET': 'Tu es plutôt du type intellectuel. Avec\n' +
    'des engagements politiques forts et\n' +
    'des convictions chevillées au corps,\n' +
    'tu prônes la défense des plus faibles,\n' +
    'tu milites, tu revendiques. Quand il\n' +
    's\'agit d\'agir, tu préfères le symbole\n' +
    'à l\'affrontement. La violence, après\n' +
    'tout, doit toujours rester le dernier\n' +
    'des recours.',
  'POUVOIR': 'C\'est vous qui tirez les ficelles. Qu\'elles soient économiques, législatives, religieuses\n' +
    'ou féodales n\'y change pas grand-chose. L\'important, c\'est que vous savez ce qui est\n' +
    'bon pour les autres. Oui, même si les autres ne sont pas d\'accord. Et non ce n\'est\n' +
    'pas immoral si vous en profitez au passage. Après tout, vous faites le job. ',
  'PEUPLE': 'Des fins-fonds des campagnes aux centres des capitales, le Peuple est - au fond - ce\n' +
    'autour de quoi tourne tous les autres. Mais le Peuple est aussi un pouvoir. Le pouvoir du\n' +
    'nombre, déjà, qui surpasse infiniment ceux qui voudraient l\'arrêter, mais aussi le pouvoir de la volonté, car en fin de compte, le Peuple ne fait que ce qu\'il veut bien faire.\n' +
    'Encore faudrait-il que ce creuset de contradictions arrive à exprimer un désir clair. ',
}

@Component({
  selector: 'ins-game-role-picker',
  imports: [
    ReactiveFormsModule,
    ButtonComponent
  ],
  templateUrl: './game-role-picker.component.html',
  styleUrl: './game-role-picker.component.scss'
})
export class GameRolePickerComponent implements AfterViewInit {

  gameId = input.required<number | undefined>();
  player = input.required<Player | undefined>();

  rolesElement = viewChild.required<ElementRef>('roles');

  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly httpService = inject(HttpService);

  description = signal<string | undefined>(undefined);
  playerRoles = signal(playerRoles);

  latestHoveredElement: HTMLElement | null = null;
  draggedRoleElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const player = this.player();
      if (!player || player.roles.length === 0) return;
      untracked(() => {
        this.playerRoles.set(player.roles);
      })
    });
  }

  ngAfterViewInit() {
    effect(() => {
      fromEvent<MouseEvent>(this.rolesElement().nativeElement, 'dragstart').pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        this.draggedRoleElement = event.target as HTMLElement;
      })

      fromEvent<MouseEvent>(this.rolesElement().nativeElement, 'dragover').pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        event.preventDefault();
        const hoveringItem = event.target as HTMLElement;
        if (!!this.draggedRoleElement && !!hoveringItem && hoveringItem !== this.draggedRoleElement && hoveringItem.tagName === "LI") {
          this.latestHoveredElement = event.target as HTMLElement;
          const bounding = this.latestHoveredElement.getBoundingClientRect();
          const offset = event.clientY - bounding.top;
          if (offset > bounding.height / 2) {
            this.latestHoveredElement.after(this.draggedRoleElement);
          } else {
            this.latestHoveredElement.before(this.draggedRoleElement);
          }
        }
      })

      fromEvent<MouseEvent>(this.rolesElement().nativeElement, 'dragend').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.playerRoles.update(roles => {
          const draggedElementIndex = roles.findIndex(it => it === this.draggedRoleElement?.id);
          const chosenIndex = roles.findIndex(it => it === this.latestHoveredElement?.id);
          if (draggedElementIndex < 0 || chosenIndex < 0) return roles;
          const updatedRoles = roles.toSpliced(draggedElementIndex, 1);
          updatedRoles.splice(chosenIndex, 0, roles[draggedElementIndex]);
          return updatedRoles;
        })
      })
    }, {injector: this.injector});
  }

  selectRole(role: PlayerRole) {
    this.description.set(descriptionByRole[role]);
  }

  saveRolesOrder() {
    const gameId = this.gameId();
    const playerId = this.player()?.id;
    if (!gameId || !playerId) return;
    this.httpService.sweetFetch(`/api/games/${gameId}/players/${playerId}/roles`, 'POST', this.playerRoles())
  }
}


