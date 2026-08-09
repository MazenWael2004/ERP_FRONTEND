
function LauncherAppItem({
  icon,
  name,
  iconClass = "",
  onClick,
}) {
  return (
    <div className="app-item" onClick={onClick}>
      <div className={`app-item-icon ${iconClass}`}>
        <img src={icon} alt={name} className="app-icon" />
      </div>

      <p className="app-item-name">{name}</p>
    </div>
  );
}

export default LauncherAppItem;