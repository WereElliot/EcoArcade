declare module '*.css?inline' {
  const content: string;
  export default content;
}

declare namespace chrome {
  namespace sidePanel {
    function setPanelBehavior(options: { openPanelOnActionClick: boolean }): Promise<void>;
    function open(options: { windowId?: number; tabId?: number }): Promise<void>;
  }

  namespace storage {
    namespace session {
      function get(keys?: string | string[] | object | null): Promise<Record<string, unknown>>;
      function set(items: object): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
    }
  }
}
