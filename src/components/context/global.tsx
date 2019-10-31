import { Container } from 'unstated'
import { _lang } from '../settings'

interface S{
  lang:string,
  cannotMove:boolean,
}

export default class GlobalContainer extends Container<S> {

  constructor(){
    super();
    this.setLang = this.setLang.bind(this);
  }

  state = {
    lang : _lang(),
    cannotMove: false
  }

  setLang(newLang:string) {
    localStorage.setItem("lang",newLang);
    this.setState({ lang: newLang })
  }

  setMove(newState:boolean) {
    this.setState({ cannotMove: newState })
  }

}
