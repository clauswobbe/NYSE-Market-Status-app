export interface IElectronAPI {
  getVersion: () => Promise<string>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

