import { EventEmitter } from "events"
import { State } from "./state"

export class Event extends EventEmitter {
  public state: State = new State()
}
