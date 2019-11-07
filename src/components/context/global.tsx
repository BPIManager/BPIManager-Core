import { Container } from 'unstated'
import { _lang,_currentStore, _currentTheme } from '../settings'

interface S{
  lang:string,
  store:string,
  theme:string,
  cannotMove:boolean,
}

export default class GlobalContainer extends Container<S> {

  constructor(){
    super();
    this.setLang = this.setLang.bind(this);
    this.setStore = this.setStore.bind(this);
    this.setTheme = this.setTheme.bind(this);
  }

  state = {
    lang : _lang(),
    store : _currentStore(),
    theme : _currentTheme(),
    cannotMove: false
  }

  setLang(newLang:string) {
    localStorage.setItem("lang",newLang);
    this.setState({ lang: newLang })
  }

  setStore(newStore:string){
    localStorage.setItem("currentStore",newStore);
    this.setState({ store: newStore });
  }

  setTheme(newTheme:string){
    localStorage.setItem("theme",newTheme);
    this.setState({ theme: newTheme });
  }

  setMove(newState:boolean) {
    this.setState({ cannotMove: newState })
  }

}
