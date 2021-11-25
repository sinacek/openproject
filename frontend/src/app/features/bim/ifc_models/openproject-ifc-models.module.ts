// -- copyright
// OpenProject is an open source project management software.
// Copyright (C) 2012-2021 the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See COPYRIGHT and LICENSE files for more details.
//++
import { NgModule } from '@angular/core';
import { OpenprojectWorkPackagesModule } from 'core-app/features/work-packages/openproject-work-packages.module';
import { UIRouterModule } from '@uirouter/angular';
import { OPSharedModule } from 'core-app/shared/shared.module';
import { IFC_ROUTES } from 'core-app/features/bim/ifc_models/openproject-ifc-models.routes';
import { IFCViewerPageComponent } from 'core-app/features/bim/ifc_models/pages/viewer/ifc-viewer-page.component';
import { BimViewToggleButtonComponent } from 'core-app/features/bim/ifc_models/toolbar/view-toggle/bim-view-toggle-button.component';
import { BimViewToggleDropdownDirective } from 'core-app/features/bim/ifc_models/toolbar/view-toggle/bim-view-toggle-dropdown.directive';
import { BimManageIfcModelsButtonComponent } from 'core-app/features/bim/ifc_models/toolbar/manage-ifc-models-button/bim-manage-ifc-models-button.component';
import { IFCViewerService } from 'core-app/features/bim/ifc_models/ifc-viewer/ifc-viewer.service';
import { OpenprojectFieldsModule } from 'core-app/shared/components/fields/openproject-fields.module';
import { BcfListContainerComponent } from 'core-app/features/bim/ifc_models/bcf/list-container/bcf-list-container.component';
import { IfcModelsDataService } from 'core-app/features/bim/ifc_models/pages/viewer/ifc-models-data.service';
import { OpenprojectBcfModule } from 'core-app/features/bim/bcf/openproject-bcf.module';
import { OpenprojectHalModule } from 'core-app/features/hal/openproject-hal.module';
import { IFCViewerComponent } from './ifc-viewer/ifc-viewer.component';
import { BcfSplitLeftComponent } from 'core-app/features/bim/ifc_models/bcf-split/left/bcf-split-left.component';
import { BcfSplitRightComponent } from 'core-app/features/bim/ifc_models/bcf-split/right/bcf-split-right.component';

@NgModule({
  imports: [
    OPSharedModule,
    OpenprojectFieldsModule,
    OpenprojectHalModule,
    OpenprojectBcfModule,
    OpenprojectWorkPackagesModule,
    UIRouterModule.forChild({
      states: IFC_ROUTES,
    }),
  ],
  providers: [
    IFCViewerService,
    IfcModelsDataService,
  ],
  declarations: [
    // Pages
    IFCViewerPageComponent,

    // Regions of pages
    BcfSplitLeftComponent,
    BcfSplitRightComponent,
    BcfListContainerComponent,

    // Toolbar
    BimManageIfcModelsButtonComponent,
    BimViewToggleButtonComponent,
    BimViewToggleDropdownDirective,

    IFCViewerComponent,
  ],
})
export class OpenprojectIFCModelsModule {
}
