import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

//   getNav(): Promise<string> {
//     return element(by.css('app-root .content span')).getText() as Promise<string>;
//   }
}