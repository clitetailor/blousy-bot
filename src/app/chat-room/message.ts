
export interface ICheckList {
  checked: boolean,
  content: string
}

export interface ICheckBoxesContent {
  title: string,
  checklist: ICheckList[];
}

export interface IMessage {
  type: string,
  time: Date,
  username: string
}

export interface IChatBox extends IMessage {
  type: 'chat-box',
  time: Date,
  content: string,
  list?: string[]
}

export interface ICheckBoxes extends IMessage {
  type: 'checkboxes',
  time: Date,
  content: ICheckBoxesContent
}

export type Message = IChatBox | ICheckBoxes;
