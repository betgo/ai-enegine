export function EmptyEditorViewport() {
  return (
    <div className="empty-editor-viewport" aria-label="Empty editor scene">
      <div className="empty-grid-plane" aria-hidden="true" />
      <div className="empty-axis empty-axis-x" aria-hidden="true" />
      <div className="empty-axis empty-axis-z" aria-hidden="true" />
      <div className="empty-origin-marker" aria-hidden="true" />
      <div className="empty-transform-gizmo" aria-hidden="true">
        <span className="gizmo-arrow gizmo-arrow-x" />
        <span className="gizmo-arrow gizmo-arrow-y" />
        <span className="gizmo-ring" />
      </div>
    </div>
  );
}
