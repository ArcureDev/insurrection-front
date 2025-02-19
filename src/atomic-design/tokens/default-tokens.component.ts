import {Component, effect, input, signal, untracked} from '@angular/core';
import {Token, TokenType} from '../../app/types';
import {TokenComponent} from './token/token.component';

@Component({
  selector: 'ins-default-tokens',
  imports: [TokenComponent],
  templateUrl: './default-tokens.component.html',
  styleUrl: './default-tokens.component.scss',
})
export class DefaultTokensComponent {
  tokens = input.required<Token[]>();
  type = input.required<TokenType>();

  title = signal<string | undefined>(undefined);
  shardTokens = signal<Token[]>([]);
  influenceTokens = signal<Token[]>([]);
  displayedTokens = signal<Token[]>([]);

  constructor() {
    effect(() => {
      const type = this.type();
      const tokens = this.tokens();
      if (!type) return;

      untracked(() => {
        this.shardTokens.set(tokens.filter(it => it.type === 'SHARD'))
        this.influenceTokens.set(tokens.filter(it => it.type === 'INFLUENCE'))

        const title =
          type === 'SHARD'
            ? this.shardTokens().length + " jetons d'éclat"
            : this.influenceTokens().length + " jetons d'influence";
        this.title.set(title);

        const displayedTokens = type === 'SHARD' ? this.shardTokens() : this.influenceTokens();
        this.displayedTokens.set(displayedTokens);
      })
    });
  }
}
