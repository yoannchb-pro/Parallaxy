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
    private frameId;
    private actualTranslation;
    private actualScale;
    constructor(element: HTMLElement, config?: Config);
    /**
     * Check the configuration and set the default config
     * @param config
     * @returns
     */
    private verfiyConfiguration;
    /**
     * Update the config on attribute change
     * @param config
     */
    updateConfig(config?: Config): void;
    /**
     * Check if the breaking point is matched
     * @returns
     */
    private matchingBreakingPoint;
    /**
     * Start the parallax
     * @returns
     */
    start(): void;
    /**
     * Stop the parallax
     */
    stop(): void;
    /**
     * Reset the transformation on the parallax
     */
    reset(): void;
    /**
     * Update the position of the image for the parallax effect
     * @returns
     */
    private updatePosition;
    /**
     * Return the y translation in px
     * @param scaledRect
     * @returns
     */
    private translateY;
    /**
     * Return the x translation in px
     * @param scaledRect
     * @returns
     */
    private translateX;
}
export { Parallaxy as default };
