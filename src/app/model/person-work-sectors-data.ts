import {Person} from "./person";

export interface PersonWorkSectorsInfoSaveRequest {
  personName: string;
  selectedWorkSectorIds: number[];
  isAcceptTermsOfService: boolean;
}

export interface PersonWorkSectorsInfoUpdateRequest {
  personWorkSectorsInfoId: number;
  personName: string;
  selectedWorkSectorIds: number[];
  isAcceptTermsOfService: boolean;
}

export interface PersonWorkSectorsInfo {
  id: number
  person: Person;
  selectedWorkSectorIds: number[];
  isAcceptTermsOfService: boolean;
}

export interface PersonWorkSectorsModificationResponse {
  personWorkSectorsId: number;
}
