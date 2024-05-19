import {HttpClient} from "@angular/common/http";
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {WorkSector} from "../model/work-sector";
import {BaseUrl} from "./model/BaseUrl";

@Injectable({
  providedIn: 'root'
})
export class WorkSectorsService {
  protected url: string = `${BaseUrl.BASE_URL}/work-sector`;

  constructor(private http: HttpClient) {
  }

  findAllWorkSectors(): Observable<WorkSector[]> {
    return this.http.get<WorkSector[]>(this.url);
  }

}
