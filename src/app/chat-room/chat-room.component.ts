import { Component, OnInit } from '@angular/core';

export interface IMessage {
  type: string,
  time: Date,
  username: string
}

export interface IChatBox extends IMessage {
  type: 'chat-box',
  time: Date,
  content: string
}

export interface ICheckBoxes extends IMessage {
  type: 'checkboxes',
  time: Date,
  choices: {
    checked: boolean,
    content: string
  }[]
}

export type Message = IChatBox | ICheckBoxes;

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.styl']
})
export class ChatRoomComponent implements OnInit {

  private messages: Message[] = [{
    type: 'chat-box',
    time: new Date(),
    content: 'show me something!',
    username: 'clitetailor',
  }, {
    type: 'checkboxes',
    time: new Date(),
    username: 'bot',
    choices: []
  }]

  private userImages = {
    clitetailor: "../../assets/clitetailor.jpg",
    bot: "../../assets/icon2.png"
  }

  constructor() { }

  ngOnInit() {

  }

  send(content) {

  }
}
