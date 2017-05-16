import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service'
import * as Message from './message'
import * as Result from './result'

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.styl']
})
export class ChatRoomComponent implements OnInit {

  private messages: Message.Message[] = []

  private userImages = {
    clitetailor: "../../assets/clitetailor.jpg",
    bot: "../../assets/blousy-bot.png"
  }

  private results: Result.ResultItem[] = []

  private exclusions = [];
  private symptoms = [];

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chatService.responseSource$.subscribe(message =>
      this.messages.push(message));

    this.chatService.liveResultSource$.subscribe(results => {
      console.log(results);
      this.results = results
    })
  }

  send(msg:string) {
    this.messages.push({ type: 'chat-box', time: new Date(), username: "clitetailor", content: msg })

    this.chatService.sendMessage(msg, {
      exclusions: this.exclusions,
      symptoms: this.symptoms
    })
  }
}
