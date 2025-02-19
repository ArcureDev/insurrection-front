import {effect, Injectable, resource, signal, untracked,} from '@angular/core';
import {toHttpParams} from './utils/object.utils';
import {Game, User} from './types';

export const api = (value: string) => `/api/${value}`;
export const apiWithParams = <T extends { [key in string]: any }>(
  value: string,
  params: T,
) => {
  const formattedParams = toHttpParams(params);
  return `/api/${value}?${formattedParams}`;
};

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  currentGameResource = resource({
    loader: () => this.sweetFetch<Game, void>(api('games/me/current')),
  });
  currentGame = signal<Game | undefined>(undefined);
  isAuthenticated = signal<boolean | undefined>(undefined);
  hasSub = signal(false)

  constructor() {
    this.currentGame = this.currentGameResource.value;

    this.isAuthenticated = resource({
      loader: async () =>
        !!(await this.sweetFetch<User, void>(api('users/authentication'))),
    }).value;

    effect(() => {
      const isAuthenticated = this.isAuthenticated();
      if (!isAuthenticated) return;
      this.currentGameResource.reload();
    });

    effect(() => {
      if (this.hasSub()) return;
      const gameId = this.currentGame()?.id;
      if (!gameId) return;

      untracked(() => {
        this.currentGameResource.reload();
        this.subscribeToGameUpdates(gameId);
      });
    });
  }

  subscribeToGameUpdates(gameId: number) {
    const eventSource = new EventSource(`/api/games/sse/${gameId}`);
    eventSource.onmessage = (event: MessageEvent<string>) => {
      const game = JSON.parse(event.data) as Game;
      this.currentGame.set(game);
    };
    eventSource.onerror = (err) => {
      this.unsubscribeToGameUpdates();
      console.error(err);
    }
    this.hasSub.set(true)
  }

  unsubscribeToGameUpdates() {
    this.currentGame.set(undefined);
    this.hasSub.set(false)
  }

  async sweetFetch<T, R>(
    url: string,
    method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'GET',
    body?: R,
  ): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error();
    }
    return (await response.json()) as Promise<T>;
  }

  async sweetFetchWithNoReturn<R>(
    url: string,
    method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'GET',
    body?: R,
  ): Promise<void> {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error();
    }
  }

  coucouGame(gameId: number) {
    this.sweetFetch<Game, void>(`/api/games/${gameId}`).then((game) => {
      this.currentGame.set(game)
    })
  }

  async logout(): Promise<void> {
    return fetch(api('logout'), {
      method: 'POST',
    }).then(() => {
      this.isAuthenticated.set(false);
    });
  }
}
