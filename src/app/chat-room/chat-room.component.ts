import { Component, OnInit } from '@angular/core';
import * as Message from './message'
import * as Result from './result'

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.styl']
})
export class ChatRoomComponent implements OnInit {

  private messages: Message.Message[] = [{
    type: 'chat-box',
    time: new Date(),
    content: 'show me something!',
    username: 'clitetailor',
  }, {
    type: 'checkboxes',
    time: new Date(),
    username: 'bot',
    content: {
      title: "what do you think?",
      checklist: [{
          checked: false,
          content: "bla, bla, bla, bla"
        }, {
          checked: true,
          content: "i love milk"
        }]
    }
  }]

  private userImages = {
    clitetailor: "../../assets/clitetailor.jpg",
    bot: "../../assets/blousy-bot.png"
  }

  private results: Result.ResultItem[] = [{
    title: "milk",
    possibility: 0.8,
    list: ["liquid", "sweet"]
  }]

  constructor() { }

  ngOnInit() {

  }

  send(msg:string) {
    this.messages.push({ type: 'chat-box', time: new Date(), username: "clitetailor", content: msg })
  }
}
