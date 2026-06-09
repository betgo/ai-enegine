import type { ReactNode } from "react";
import type {
  BottomTab,
  ResourceAsset,
  ViewportMode
} from "./editor-shell-types";
import { assetCategories } from "./editor-shell-data";

interface ViewportWorkspaceProps {
  bottomTab: BottomTab;
  error: string | null;
  logs: string[];
  preview: ReactNode;
  validationMessage: string;
  validationOk: boolean;
  viewportOverlayMode: ViewportMode;
  assets: ResourceAsset[];
  onBottomTabChange(tab: BottomTab): void;
  onViewportOverlayModeChange(mode: ViewportMode): void;
}

export function ViewportWorkspace({
  assets,
  bottomTab,
  error,
  logs,
  preview,
  validationMessage,
  validationOk,
  viewportOverlayMode,
  onBottomTabChange,
  onViewportOverlayModeChange
}: ViewportWorkspaceProps) {
  return (
    <section className="viewport-column" aria-label="Editor viewport and bottom panels">
      <section className="viewport-shell" aria-label="Viewport">
        <div className="viewport-empty-fallback" aria-hidden="true">
          <div className="fallback-grid-plane" />
          <div className="fallback-axis fallback-axis-x" />
          <div className="fallback-axis fallback-axis-z" />
          <div className="fallback-origin" />
          <div className="fallback-gizmo" />
        </div>
        {preview}
        <ViewportOverlays
          viewportOverlayMode={viewportOverlayMode}
          onViewportOverlayModeChange={onViewportOverlayModeChange}
        />
      </section>
      <BottomPanel
        assets={assets}
        bottomTab={bottomTab}
        error={error}
        logs={logs}
        validationMessage={validationMessage}
        validationOk={validationOk}
        onBottomTabChange={onBottomTabChange}
      />
    </section>
  );
}

function ViewportOverlays({
  viewportOverlayMode,
  onViewportOverlayModeChange
}: {
  viewportOverlayMode: ViewportMode;
  onViewportOverlayModeChange(mode: ViewportMode): void;
}) {
  return (
    <>
      <div className="viewport-top-overlay">
        <div className="segmented" role="group" aria-label="View mode">
          {(["2D", "2.5D", "3D"] as const).map((mode) => (
            <button
              aria-pressed={viewportOverlayMode === mode}
              className={viewportOverlayMode === mode ? "active" : undefined}
              key={mode}
              type="button"
              onClick={() => onViewportOverlayModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="overlay-toggles">
          {["网格", "轴线", "边界", "AI区域", "视野"].map((label, index) => (
            <button className={index <= 2 ? "active" : undefined} key={label} type="button">
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="viewport-bottom-tools" aria-hidden="true">
        <span>✋</span><span>✣</span><span>◉</span><span>⟳</span><span>▢</span>
      </div>
      <div className="mini-map" aria-label="Mini map preview"><div className="mini-map-frame" /></div>
      <div className="zoom-control"><span>☀</span><strong>100%</strong><span>⌄</span></div>
    </>
  );
}

function BottomPanel({
  assets,
  bottomTab,
  error,
  logs,
  validationMessage,
  validationOk,
  onBottomTabChange
}: {
  assets: ResourceAsset[];
  bottomTab: BottomTab;
  error: string | null;
  logs: string[];
  validationMessage: string;
  validationOk: boolean;
  onBottomTabChange(tab: BottomTab): void;
}) {
  return (
    <section className="bottom-panel" aria-label="Resources and logs">
      <div className="bottom-tabs" role="tablist" aria-label="Bottom panel tabs">
        {[
          ["assets", "资源库"],
          ["logs", "日志"],
          ["errors", "错误列表"]
        ].map(([tab, label]) => (
          <button
            aria-selected={bottomTab === tab}
            className={bottomTab === tab ? "active" : undefined}
            key={tab}
            type="button"
            onClick={() => onBottomTabChange(tab as BottomTab)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="bottom-content">
        {bottomTab === "assets" ? <ResourceLibrary assets={assets} /> : null}
        {bottomTab === "logs" ? <LogPanel logs={logs} /> : null}
        {bottomTab === "errors" ? (
          <ErrorPanel error={error} validationMessage={validationMessage} validationOk={validationOk} />
        ) : null}
      </div>
    </section>
  );
}

function ResourceLibrary({ assets }: { assets: ResourceAsset[] }) {
  return (
    <div className="resource-library">
      <aside className="resource-categories">
        {assetCategories.map((category) => (
          <button className={category === "单位" ? "active" : undefined} key={category} type="button">
            {category}
          </button>
        ))}
      </aside>
      <section className="resource-main">
        <div className="resource-actions">
          <button disabled type="button">导入</button>
          <button disabled type="button">新建文件夹</button>
          <label><span>⌕</span><input placeholder="搜索资源..." type="search" /></label>
          <div className="resource-view-buttons" aria-hidden="true"><span>▦</span><span>☷</span></div>
        </div>
        <div className="asset-grid">
          {assets.map((asset, index) => (
            <article className={index === 0 ? "asset-card active" : "asset-card"} key={asset.id}>
              <div className="asset-thumb">{asset.icon}</div>
              <strong>{asset.name}</strong>
              <span>{asset.id}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function LogPanel({ logs }: { logs: string[] }) {
  return (
    <div className="log-panel">
      <div className="log-filter"><button className="active" type="button">全部</button><button disabled type="button">搜索结果</button></div>
      <div className="log-list">{logs.map((log) => <p key={log}>{log}</p>)}</div>
    </div>
  );
}

function ErrorPanel({
  error,
  validationMessage,
  validationOk
}: {
  error: string | null;
  validationMessage: string;
  validationOk: boolean;
}) {
  return (
    <div className="error-panel">
      <p className={validationOk ? "status" : "error"}>{validationMessage}</p>
      {error ? <p className="error">{error}</p> : <p className="status">暂无 Runtime 错误</p>}
    </div>
  );
}
