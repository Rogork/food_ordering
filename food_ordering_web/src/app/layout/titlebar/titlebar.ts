import { CommonModule } from '@angular/common';
import { Component, model, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDialog, TuiIcon, TuiLabel, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';

@Component({
  selector: 'app-titlebar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiIcon,
    TuiButton,
    TuiDialog,
    TuiLoader,
    TuiTextfield,
    TuiSelect,
  ],
  templateUrl: './titlebar.html',
  styleUrl: './titlebar.less',
})
export class Titlebar {

  constructor(){}

  isJoining = signal(false);
  joinCode = model<string>('');
  showJoinDialog = signal(false);
  joinGroup() {
    this.isJoining.set(true);
  }
}
