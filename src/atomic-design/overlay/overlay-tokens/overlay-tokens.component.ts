import {Component, effect, inject, Injector, input, resource, signal, untracked} from '@angular/core';
import {HttpService} from '../../../app/http.service';
import {Token, TokenType} from '../../../app/types';
import {DefaultTokensComponent} from '../../tokens/default-tokens.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ins-overlay-tokens',
  imports: [
    DefaultTokensComponent
  ],
  templateUrl: './overlay-tokens.component.html',
  styleUrl: './overlay-tokens.component.scss'
})
export class OverlayTokensComponent {

  playerId = input<number | undefined>(undefined);

  private readonly httpService = inject(HttpService);
  private readonly injector = inject(Injector);
  private readonly router = inject(ActivatedRoute);

  tokens = signal<Token[]>([]);
  type = signal<TokenType | undefined>(undefined);

  constructor() {
    this.router.queryParams.subscribe(params => {
      this.type.set(params['type'])
    })

    effect(() => {
      const playerId = this.playerId();
      if (!playerId) return;
      untracked(() => {
        resource({
          loader: async () => {
            const tokens = await this.httpService.sweetFetch<Token[], void>(`/api/players/${this.playerId()}/tokens`)
            this.tokens.set(tokens);
          },
          injector: this.injector
        });
      });
    });
  }

}
