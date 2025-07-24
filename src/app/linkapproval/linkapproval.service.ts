import { Injectable } from '@angular/core';
import { BaseService } from '../../base.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DALService } from '../../DALservice.service';


const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded', }), responseType: 'text' as 'json' };

@Injectable()
export class LoginService extends BaseService {

  constructor(
    private _http: HttpClient,
    private _dalservice: DALService,
    public route: Router) {
    super();
  }

  // tslint:disable-next-line:member-ordering
  // private _urlGetToken = 'http://112.78.164.236:7272/v5_token/api/Authenticate/request';
  // private _urlGetToken = 'http://192.168.1.80/v5_token/api/Authenticate/request';
  // tslint:disable-next-line:member-ordering
  // private _urlGetToken = 'http://localhost:5833/api/Authenticate/request';

  // private _urlGetToken = 'http://localhost/v5_token/api/Authenticate/request';

//   public getJSON(): Observable<any> {
//     return this._http.get("./assets/js/" + "configEnv" + ".json");
//   }
  

  // tslint:disable-next-line:member-ordering
  getToken(username: string, password: string, urlToken): Observable<any> {

    // jika memakai x-www-form-urlencoded
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    // end
    // console.log(this._dalservice.getJSON("addressUrlAll"));
    
    // const httpOptions = { jika pake header
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'username': username,
    //     'password': password
    //   }), responseType: 'text' as 'json'
    // };

    const url = `${urlToken}`;
    return this._http.post<any[]>(url, body.toString(), httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }


}
