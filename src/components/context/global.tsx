import { Container } from 'unstated'
import { _lang,_currentStore, _currentTheme, _isSingle, _goalBPI, _goalPercentage, _area } from '../settings'

interface S{
  lang:string,
  store:string,
  theme:string,
  cannotMove:boolean,
  isSingle:number,
  goalBPI:number,
  goalPercentage:number,
  area:number,
  update:boolean,
  userData:any,
}

export default class GlobalContainer extends Container<S> {

  constructor(){
    super();
    this.setLang = this.setLang.bind(this);
    this.setStore = this.setStore.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.setIsSingle = this.setIsSingle.bind(this);
    this.setGoalBPI = this.setGoalBPI.bind(this);
    this.setGoalPercentage = this.setGoalPercentage.bind(this);
    this.setArea = this.setArea.bind(this);
    this.setUpdateAvailable = this.setUpdateAvailable.bind(this);
    this.setUserData = this.setUserData.bind(this);
  }

  state = {
    lang : _lang(),
    store : _currentStore(),
    theme : _currentTheme(),
    isSingle : _isSingle(),
    goalBPI : _goalBPI(),
    goalPercentage : _goalPercentage(),
    area: _area(),
    update:false,
    cannotMove: false,
    userData:null
  }

  setUserData(userData:any){
    this.setState({ userData: userData })
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

  setIsSingle(newState:number){
    localStorage.setItem("isSingle",String(newState));
    this.setState({ isSingle: newState });
  }

  setGoalBPI(newState:number){
    localStorage.setItem("goalBPI",String(newState));
    this.setState({ goalBPI: newState });
  }

  setArea(newState:number){
    localStorage.setItem("area",String(newState));
    this.setState({ area: newState });
  }

  setGoalPercentage(newState:number){
    localStorage.setItem("goalPercentage",String(newState));
    this.setState({ goalPercentage: newState });
  }

  setMove(newState:boolean) {
    this.setState({ cannotMove: newState })
  }

  setUpdateAvailable(newState:boolean) {
    this.setState({ update: newState })
  }

}
