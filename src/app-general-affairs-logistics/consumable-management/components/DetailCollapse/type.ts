export interface IDetailConfig {
  realNumFileName: string;
  columns: {
    name?: string;
    key?: string;
    value?: string | number;
  }[];
}
