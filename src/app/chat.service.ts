import { Injectable } from '@angular/core';
import { Http } from '@angular/http'
import 'rxjs/add/Operator/toPromise'

@Injectable()
export class ChatService {
  constructor(private http: Http) { }

  sendMessage(message) {
    return this.http.post(
        'http://localhost:80/chatting',
        { message }
      )
      .toPromise<any>()
      .then(data => this.extractData(data))
  }

  submit(symptoms, exclusions) {
    return this.http.post(
        'http://localhost:80/submit',
        { symptoms, exclusions }
      )
      .toPromise<any>()
      .then(data => this.extractData(data))
  }

  extractData(data) {
    return data.json();
  }
}
