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
declare class Parallaxy {
    private element;
    private config;
    private mainEvent;
    private windowHeight;
    constructor(element: HTMLElement, config: Config);
    private verfiyConfiguration;
    updateConfig(): void;
    private matchingBreakingPoint;
    start(): void;
    stop(): void;
    reset(): void;
    private isIntersectingObserver;
    private updatePosition;
    private originalRect;
    private scale;
    private translateY;
    private translateX;
}
export { Parallaxy as default };
