import {Person} from "./person";

export interface PersonWorkSectorsDataSaveRequest {
  personName: string;
  selectedWorkSectorIds: number[];
  isAcceptTermsOfService: boolean;
}

export interface PersonWorkSectorsData {
  person: Person;
  selectedWorkSectorIds: number[];
  isAcceptTermsOfService: boolean;
}

export interface PersonWorkSectorsCreationResponse {
  personWorkSectorsId: number;
}
