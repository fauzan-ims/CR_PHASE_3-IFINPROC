import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

// const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' as 'json' };

@Injectable()
export class DALService extends BaseService {

  constructor(private _http: HttpClient, public getRouteparam: ActivatedRoute) {
    super();
  }

  //#region getJsonCnv
  public getJSON(): Observable<any> {
    return this._http.get("./assets/js/" + "configEnv" + ".json");
  }
  //#endregion getJsonCnv 

  protected urlAddr = this.AllModUrl('urlAddressProc');
  protected urlAddrSys = this.AllModUrl('urlAddressSys');
  protected urlAddrBam = this.AllModUrl('urlAddressBam');
  protected urlReport = this.AllModUrl('urlReportProc');
  protected urlAddrApv = this.AllModUrl('urlAddressApv');
  protected urlAddrAms = this.AllModUrl('urlAddressAms');


  protected _urlAddress = this.urlAddr;
  protected _urlAddressSys = this.urlAddrSys;
  protected _urlAddressBam = this.urlAddrBam;
  protected _urlReport = this.urlReport;
  protected _urlAddressApv = this.urlAddrApv;
  protected _urlAddressAms = this.urlAddrAms;
  

  //#region RefreshToken 
  RefreshToken(jsonContent: any): Observable<any> {
    return this._http.post<any[]>(this.AllModUrl('urlRefreshToken'), jsonContent, this.httpOptionsRefreshToken).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  //#endregion RefreshToken

  Getrows(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  GetrowsSys(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressSys + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }
  GetrowsBam(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressBam + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  Getrow(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  GetrowSys(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressSys + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  GetrowBam(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressBam + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  Insert(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`inserted success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  InsertSys(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddressSys + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`inserted success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  Update(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`updated success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  Delete(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSp(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSpSys(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressSys + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSpBam(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressBam + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSpAms(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressAms + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  UploadFile(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`inserted success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  PriviewFile(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`priview image=${data[0].p_file_name}`)),
      catchError(this.handleError)
    );
  }

  DownloadFile(controller: String, route: String): Observable<any> {
    const url = `${this._urlReport + controller + '/' + route}`;
    return this._http.get(url, this.httpOptionsDownload).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  DeleteFile(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`deleted image=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  //report non core
  ReportFile(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlReport + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptionsReport).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  DownloadFileWithParam(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptionsDownload).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  DownloadFileWithData(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddress + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptionsDownload).pipe(
      tap(data => data),
      catchError(this.handleError)
    )
  }

  GetrowsApv(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressApv + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  GetrowApv(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressApv + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  ExecSpApv(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressApv + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }

  UpdateApv(data: any, controller: String, route: String): Observable<any> {
    const result = JSON.stringify(data);
    const url = `${this._urlAddressApv + controller + '/' + route}`;
    return this._http.post<any[]>(url, result, this.httpOptions).pipe(
      tap(_ => console.log(`updated success code=${data[0].p_code}`)),
      catchError(this.handleError)
    );
  }

  GetrowsAms(data: any, controller: String, route: String): Observable<any> {
    const url = `${this._urlAddressAms + controller + '/' + route}`;
    return this._http.post<any[]>(url, data, this.httpOptions).pipe(
      tap(_ => console.log(`Success!`)),
      catchError(this.handleError)
    );
  }



}
