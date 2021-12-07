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

import { APIv3GettableResource, APIv3ResourceCollection } from 'core-app/core/apiv3/paths/apiv3-resource';
import { APIV3Service } from 'core-app/core/apiv3/api-v3.service';
import { Observable } from 'rxjs';
import { View } from 'core-app/core/state/views/view.model';
import { InjectField } from 'core-app/shared/helpers/angular/inject-field.decorator';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export class APIv3ViewsPaths extends APIv3ResourceCollection<View, APIv3GettableResource<View>> {
  @InjectField() http:HttpClient;

  constructor(
    protected apiRoot:APIV3Service,
    protected basePath:string,
  ) {
    super(apiRoot, basePath, 'views');
  }

  /**
   * Create a new view
   *
   * @param TODO
   */
  post(resource:View|unknown, type:string):Observable<View> {
    return this
      .http
      .post(
        `${this.path}/${type})}`,
        { resource },
        {
          withCredentials: true,
          responseType: 'json',
        },
      ).pipe(
        map((view:View) => view),
      );
  }
}
