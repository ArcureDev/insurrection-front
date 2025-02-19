import {Component, inject} from '@angular/core';
import {HttpService} from './http.service';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'ins-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
