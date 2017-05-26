import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatBoxComponent } from './chat-room/chat-box/chat-box.component';
import { CheckboxesComponent } from './chat-room/checkboxes/checkboxes.component';
import { ResultListItemComponent } from './chat-room/result-list-item/result-list-item.component';

import { ChatService } from './chat.service';

const appRoutes = [
  { path: '', component: HomePageComponent },
  { path: 'chat', component: ChatRoomComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ChatRoomComponent,
    ChatBoxComponent,
    CheckboxesComponent,
    ResultListItemComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
