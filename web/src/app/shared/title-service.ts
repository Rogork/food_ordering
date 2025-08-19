import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  public readonly title = signal('Big Foods');
  public readonly subtitle = signal<string|null>(null);
  public readonly fullTitle = computed(() => this.subtitle() !== null ? `${this.title()} - ${this.subtitle()}` : this.title());
}
