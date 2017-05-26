import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Message from '../message';

@Component({
  selector: 'app-checkboxes',
  templateUrl: './checkboxes.component.html',
  styleUrls: ['./checkboxes.component.styl']
})
export class CheckboxesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input('checklist') checklist: Message.ICheckList[];

  @Output('submit') submit: EventEmitter<any> = new EventEmitter();
}
