export interface IPlugin {
  onLoad: () => void;
  unload: () => void;
  timer?: NodeJS.Timer;
}
