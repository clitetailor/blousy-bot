import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import * as io from 'socket.io-client'

@Injectable()
export class ChatService {

  private socket = io('http://localhost:80')

  responseSource$: Observable<any>;
  liveResultSource$: Observable<any>;

  constructor() {
    this.responseSource$ = new Observable(observer =>
      this.socket.on('response', response =>
        observer.next(response)))

    this.responseSource$.subscribe(response => console.log(response))

    this.liveResultSource$ = new Observable(observer =>
      this.socket.on('live-result', response =>
        observer.next(response)))

    this.liveResultSource$.subscribe(response => console.log(response))
  }

  sendMessage(message, info?) {
    this.socket.emit('message', message, info);
  }
}
