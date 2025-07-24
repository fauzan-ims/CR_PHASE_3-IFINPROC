import {EventEmitter, Injectable} from '@angular/core';
  import {Subject, Subscription} from 'rxjs';  
    
  @Injectable({    
    providedIn: 'root'    
  }) 
  
export class EventEmitterService {    
  // @Injectable makes to available services in root level.
  invokeFirstComponentFunction = new EventEmitter();
  subsVar: Subscription;   
  
  onFirstComponentButtonClick() {    
    this.invokeFirstComponentFunction.emit();    
  }   
}    