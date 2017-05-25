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

  ngOnInit() { }

  send(msg:string) {
    this.messages.push({
      type: 'chat-box',
      time: new Date(),
      username: "clitetailor",
      content: msg
    })

    this.chatService.sendMessage(msg)
      .then(response => {
        this.processResponse(response);
      })
  }

  submit() {

  }

  processResponse(response) {
    console.log(response)

    switch (response.type) {
      case "list symptoms": {
        this.messages.push({
          type: 'chat-box',
          username: 'bot',
          time: new Date(),
          content: `Các triệu chứng của bệnh ${response.illness.name} là:`,
          list: response.symptoms.map(symptom => {
            return symptom.name
          })
        })

        break;
      }

      case "response immediately": {
        this.messages.push({
          type: 'chat-box',
          time: new Date(),
          username: 'bot',
          content: response.message
        })

        break;
      }

      case "predict illness": {
        this.symptoms = response.symptoms;
        this.exclusions = response.exclusions;

        this.messages.push({
          type: 'checkboxes',
          time: new Date(),
          username: 'bot',
          content: {
            title: 'Bạn có mắc phải triệu chứng nào trong các triệu chứng sau:',
            checklist: response.otherSymptoms.map(symptom => {
              return {
                checked: false,
                content: symptom.name
              }
            })
          }
        })

        break;
      }

      default: {
        break;
      }
    }
  }
}
