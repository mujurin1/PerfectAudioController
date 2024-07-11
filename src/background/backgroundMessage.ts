
export type ServiceWorkerMessage = CheckExistTabs;

export interface CheckExistTabs {
  type: "CheckExistTabs";
  tabIds: number[];
}
export interface CheckExistTabsResult {
  type: "CheckExistTabsResult";
  existTabs: number[];
  notExistTabs: number[];
}
