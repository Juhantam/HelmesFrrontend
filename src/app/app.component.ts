import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";
import {take} from "rxjs";
import {ErrorMessagesComponent} from "./component/error-messages/error-messages.component";
import {
  PersonWorkSectorsInfo,
  PersonWorkSectorsInfoSaveRequest,
  PersonWorkSectorsInfoUpdateRequest,
  PersonWorkSectorsModificationResponse
} from "./model/person-work-sectors-data";
import {ValidationErrorCode} from "./model/validation-error-code";
import {WorkSector} from "./model/work-sector";
import {PersonWorkSectorsService} from "./service/person-work-sectors.service";
import {WorkSectorsService} from "./service/work-sector.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly VALIDATION_MESSAGES: Record<string, string> = {
    NAME_IS_MANDATORY: 'Name is mandatory.',
    MUST_SELECT_AT_LEAST_ONE_SECTOR: 'At least one work sector must be selected.',
    MUST_ACCEPT_TERMS_OF_SERVICE: 'Terms of service must be accepted.',
    PERSON_WORK_SECTORS_INFO_ID_IS_MISSING: 'Person work sectors info id is missing',
  };

  dataLoaded: boolean = false;
  flatSectorMap = new Map<WorkSectorFlatOption, WorkSectorOption>();
  nestedSectorMap = new Map<WorkSectorOption, WorkSectorFlatOption>();
  selectedParent: WorkSectorFlatOption | null = null;
  treeControl: FlatTreeControl<WorkSectorFlatOption>;
  treeFlattener: MatTreeFlattener<WorkSectorOption, WorkSectorFlatOption>;
  dataSource: MatTreeFlatDataSource<WorkSectorOption, WorkSectorFlatOption>;
  checklistSelection = new SelectionModel<WorkSectorFlatOption>(true);

  isAcceptTermsOfService: boolean = false;
  personName: string | undefined = '';

  private personWorkSectorsInfo?: PersonWorkSectorsInfo;

  constructor(private personWorkSectorsService: PersonWorkSectorsService,
              private workSectorService: WorkSectorsService,
              private matSnackBar: MatSnackBar) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<WorkSectorFlatOption>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
  }

  ngOnInit(): void {
    this.workSectorService.findAllWorkSectors().subscribe(sectors => {
      let options: WorkSectorOption[] = [];
      this.populateWorkSectorTree(sectors, options);
      this.dataSource.data = this.sortSectorTreeByName(options);
      this.dataLoaded = true;
    })
  }

  getLevel = (sector: WorkSectorFlatOption) => sector.level;

  isExpandable = (sector: WorkSectorFlatOption) => sector.expandable;

  getChildren = (sector: WorkSectorOption): WorkSectorOption[] => sector.childSectors;

  hasChild = (_: number, _sectorData: WorkSectorFlatOption) => _sectorData.expandable;
  transformer = (sector: WorkSectorOption, level: number) => {
    const existingNode = this.nestedSectorMap.get(sector);
    const flatSector =
      existingNode && existingNode.id === sector.id
        ? existingNode
        : new WorkSectorFlatOption();
    flatSector.id = sector.id;
    flatSector.item = sector.name;
    flatSector.level = level;
    flatSector.expandable = sector.childSectors.length > 0;
    this.flatSectorMap.set(flatSector, sector);
    this.nestedSectorMap.set(sector, flatSector);
    return flatSector;
  };

  descendantsAllSelected(sector: WorkSectorFlatOption): boolean {
    const descendants = this.treeControl.getDescendants(sector);
    return descendants.every((child) =>
      this.checklistSelection.isSelected(child)
    );
  }

  descendantsPartiallySelected(sector: WorkSectorFlatOption): boolean {
    const descendants = this.treeControl.getDescendants(sector);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(sector);
  }

  sectorSelectionToggle(sector: WorkSectorFlatOption): void {
    this.checklistSelection.toggle(sector);
    const descendants = this.treeControl.getDescendants(sector);
    this.checklistSelection.isSelected(sector)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  sortSectorTreeByName(sectors: WorkSectorOption[]): WorkSectorOption[] {
    return sectors.map(sector => {
      if (sector.childSectors && sector.childSectors.length > 0) {
        sector.childSectors = this.sortSectorTreeByName(sector.childSectors);
      }
      return sector;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  private populateWorkSectorTree(sectors: WorkSector[], options: WorkSectorOption[]) {
    const sectorMap: { [key: string]: WorkSectorOption } = {};

    sectors.forEach(sector => {
      sectorMap[sector.id] = {
        id: sector.id,
        name: sector.name,
        parentSectorId: sector.parentSectorId,
        childSectors: []
      };
    });

    sectors.forEach(sector => {
      if (sector.parentSectorId) {
        const parent = sectorMap[sector.parentSectorId];
        if (parent) {
          parent.childSectors.push(sectorMap[sector.id]);
        }
      } else {
        options.push(sectorMap[sector.id]);
      }
    });
  }

  saveOrUpdatePersonWorkSectorsInfo(): void {
    if (this.personWorkSectorsInfo) {
      this.updatePersonWorkSectorsInfo();
    } else {
      this.savePersonWorkSectorsInfo();
    }
  }

  private savePersonWorkSectorsInfo(): void {
    this.personWorkSectorsService.savePersonWorkSectorsInfo(
      {
        personName: this.personName,
        selectedWorkSectorIds: this.checklistSelection.selected.map(selectedSector => selectedSector.id),
        isAcceptTermsOfService: this.isAcceptTermsOfService
      } as PersonWorkSectorsInfoSaveRequest)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.matSnackBar.open("Person work sectors info saved successfully", undefined,
            {
              duration: 5000
            })
          this.doAfterSuccessfulSaveOrUpdate(response);
        },
        error: errorResponse => {
          const errorCodes: ValidationErrorCode[] = errorResponse?.error?.errorCodes ?? [];
          this.matSnackBar.openFromComponent(ErrorMessagesComponent, {
            data: errorCodes.map(errorCode => this.VALIDATION_MESSAGES[errorCode.name]),
            duration: 5000
          })
        }
      });
  }

  private updatePersonWorkSectorsInfo(): void {
    this.personWorkSectorsService.updatePersonWorkSectorsInfo(
      {
        personWorkSectorsInfoId: this.personWorkSectorsInfo?.id,
        personName: this.personName,
        selectedWorkSectorIds: this.checklistSelection.selected.map(selectedSector => selectedSector.id),
        isAcceptTermsOfService: this.isAcceptTermsOfService
      } as PersonWorkSectorsInfoUpdateRequest)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.matSnackBar.open("Person work sectors info updated successfully", undefined,
            {
              duration: 5000
            })
          this.doAfterSuccessfulSaveOrUpdate(response);
        },
        error: errorResponse => {
          const errorCodes: ValidationErrorCode[] = errorResponse?.error?.errorCodes ?? [];
          this.matSnackBar.openFromComponent(ErrorMessagesComponent, {
            data: errorCodes.map(errorCode => this.VALIDATION_MESSAGES[errorCode.name]),
            duration: 5000
          })
        }
      });
  }

  private doAfterSuccessfulSaveOrUpdate(response: PersonWorkSectorsModificationResponse) {
    this.personWorkSectorsService.getPersonWorkSectorsInfo(response.personWorkSectorsId)
      .subscribe(info => {
        this.personWorkSectorsInfo = info
        this.refreshPersonWorkSectorsInfo();
      });
  }

  private refreshPersonWorkSectorsInfo() {
    if (!!this.personWorkSectorsInfo) {
      this.personName = this.personWorkSectorsInfo.person.name;
      // For some reason this.checklistSelection.setSelected(whateverArray) is not compiling so had to select one by one
      const options: WorkSectorFlatOption[] = this.treeControl.dataNodes.filter(node => this.personWorkSectorsInfo?.selectedWorkSectorIds.includes(node.id));
      options.forEach(option => this.checklistSelection.select(option));
      this.isAcceptTermsOfService = this.personWorkSectorsInfo.isAcceptTermsOfService
    }
  }

  isAllDataPresent(): boolean {
    return !!this.personName && this.personName.length > 0 &&
      this.checklistSelection.selected.length > 0 &&
      this.isAcceptTermsOfService;
  }
}

export interface WorkSectorOption {
  id: number;
  name: string;
  parentSectorId: number | null;
  childSectors: WorkSectorOption[];
}

export class WorkSectorFlatOption {
  id: number = -1;
  item: string = '';
  expandable: boolean = false;
  level: number = 0;
}
