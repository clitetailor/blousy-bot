import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.styl']
})
export class ChatBoxComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input('list') list: string[];
}
