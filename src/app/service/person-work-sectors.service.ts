import {HttpClient} from "@angular/common/http";
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  PersonWorkSectorsInfo,
  PersonWorkSectorsInfoSaveRequest,
  PersonWorkSectorsInfoUpdateRequest,
  PersonWorkSectorsModificationResponse
} from "../model/person-work-sectors-data";
import {BaseUrl} from "./model/BaseUrl";

@Injectable({
  providedIn: 'root'
})
export class PersonWorkSectorsService {
  protected url: string = `${BaseUrl.BASE_URL}/person-work-sectors-info`;

  constructor(private http: HttpClient) {
  }

  savePersonWorkSectorsInfo(personWorkSectorsSaveInfo: PersonWorkSectorsInfoSaveRequest): Observable<PersonWorkSectorsModificationResponse> {
    return this.http.post<PersonWorkSectorsModificationResponse>(this.url, personWorkSectorsSaveInfo);
  }

  updatePersonWorkSectorsInfo(personWorkSectorsUpdateInfo: PersonWorkSectorsInfoUpdateRequest): Observable<PersonWorkSectorsModificationResponse> {
    return this.http.put<PersonWorkSectorsModificationResponse>(this.url, personWorkSectorsUpdateInfo);
  }

  getPersonWorkSectorsInfo(personWorkSectorsInfoId: number): Observable<PersonWorkSectorsInfo> {
    return this.http.get<PersonWorkSectorsInfo>(this.url, {params: {personWorksSectorsInfoId: personWorkSectorsInfoId}});
  }
}
