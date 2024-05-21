import {HttpClient} from "@angular/common/http";
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  PersonWorkSectorsCreationResponse,
  PersonWorkSectorsDataSaveRequest,
  PersonWorkSectorsInfo
} from "../model/person-work-sectors-data";
import {BaseUrl} from "./model/BaseUrl";

@Injectable({
  providedIn: 'root'
})
export class PersonWorkSectorsService {
  protected url: string = `${BaseUrl.BASE_URL}/person-work-sectors-info`;

  constructor(private http: HttpClient) {
  }

  savePersonWorkSectorsInfo(personWorkSectorsData: PersonWorkSectorsDataSaveRequest): Observable<PersonWorkSectorsCreationResponse> {
    return this.http.post<PersonWorkSectorsCreationResponse>(this.url, personWorkSectorsData);
  }

  getPersonWorkSectorsInfo(personWorkSectorsInfoId: number): Observable<PersonWorkSectorsInfo> {
    return this.http.get<PersonWorkSectorsInfo>(this.url, {params: {personWorksSectorsInfoId: personWorkSectorsInfoId}});
  }
}
