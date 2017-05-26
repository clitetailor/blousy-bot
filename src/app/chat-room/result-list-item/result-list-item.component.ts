import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-result-list-item',
  templateUrl: './result-list-item.component.html',
  styleUrls: ['./result-list-item.component.styl']
})
export class ResultListItemComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input('title') title: string;
  @Input('possibility') possibility: number;

  @Input('info') info: string;
  @Input('list') list: string[];

  collapse = true;
}
