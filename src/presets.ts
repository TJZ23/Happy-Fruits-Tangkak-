/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanyProfile, CustomerProfile, SavedPresetItem } from './types';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: "",
  regNo: "",
  addressLines: [],
  tel: "",
  fax: ""
};

export const DEFAULT_CUSTOMERS: CustomerProfile[] = [];

export const DEFAULT_PRESET_ITEMS: SavedPresetItem[] = [];
