import { CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { api } from '../http.service';
import { inject } from '@angular/core';
import { PATH_LOGIN, route } from '../app.routes';

export const authenticationGuard = (): CanActivateChildFn => {
  return ():
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree => {
    const router = inject(Router);
    return fetch(api('users/authentication')).then((response) => {
      return response.ok ? true : router.parseUrl(route(PATH_LOGIN));
    });
  };
};
