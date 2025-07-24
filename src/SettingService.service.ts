import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';


export class SettingService {

    constructor(private http: HttpClient) {

    }



    public getJSON(file): Observable<any> {
        return this.http.get("./assets/js/" + "configEnv" + ".json");
    }

    // public getSetting(){
    //     // use setting here
    // }
}