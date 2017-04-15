import { BlousyBotPage } from './app.po';

describe('blousy-bot App', () => {
  let page: BlousyBotPage;

  beforeEach(() => {
    page = new BlousyBotPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
