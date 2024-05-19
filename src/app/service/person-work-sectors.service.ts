import {HttpClient} from "@angular/common/http";
import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {PersonWorkSectorsCreationResponse, PersonWorkSectorsDataSaveRequest} from "../model/person-work-sectors-data";
import {BaseUrl} from "./model/BaseUrl";

@Injectable({
  providedIn: 'root'
})
export class PersonWorkSectorsService {
  protected url: string = `${BaseUrl.BASE_URL}/person-work-sectors-info`;

  constructor(private http: HttpClient) {
  }

  savePersonWorkSectorsInfo(personWorkSectorsData: PersonWorkSectorsDataSaveRequest): Observable<PersonWorkSectorsCreationResponse> {
    return this.http.post<PersonWorkSectorsCreationResponse>(this.url, personWorkSectorsData)
      .pipe(tap(console.log));
  }

  getPersonWorkSectors(): Observable<PersonWorkSectorsDataSaveRequest> {
    return this.http.get<PersonWorkSectorsDataSaveRequest>(this.url);
  }

  getTest(): Observable<any> {
    return this.http.get<string>(this.url, {params: {personName: "TEST"}});
  }

}
