import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './nav/nav';
import { Titlebar } from './titlebar/titlebar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Nav, Titlebar],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
