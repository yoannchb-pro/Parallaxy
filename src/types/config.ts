type Config = {
  y?: {
    speed: number;
    inverted?: boolean;
    overflow?: boolean;
  };
  x?: {
    speed: number;
    inverted?: boolean;
    overflow?: boolean;
  };
  axes?: number;
  breakPoint?: string;
  scale?: number;
};

export default Config;
