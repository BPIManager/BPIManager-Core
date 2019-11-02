import { Container } from 'unstated'
import { _lang,_currentStore } from '../settings'

interface S{
  lang:string,
  store:string,
  cannotMove:boolean,
}

export default class GlobalContainer extends Container<S> {

  constructor(){
    super();
    this.setLang = this.setLang.bind(this);
    this.setStore = this.setStore.bind(this);
  }

  state = {
    lang : _lang(),
    store : _currentStore(),
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

  setMove(newState:boolean) {
    this.setState({ cannotMove: newState })
  }

}
