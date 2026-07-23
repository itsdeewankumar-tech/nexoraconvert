export type Annotation = {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  rotation: number;
  align: 'left' | 'center' | 'right';
  deleted: boolean;
  createdAt: number;
};

export type PageState = {
  index: number;
  width: number;
  height: number;
  loaded: boolean;
};
