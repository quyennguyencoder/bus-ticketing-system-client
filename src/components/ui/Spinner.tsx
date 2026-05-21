export const Spinner = ({ label = 'Dang tai' }: { label?: string }) => (
  <div className="state state-inline">
    <span className="spinner" />
    <span>{label}</span>
  </div>
)

