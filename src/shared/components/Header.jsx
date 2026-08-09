import MenuIcon from '../../assets/menu.png';





function Header({
  route,
  buttonText,
  buttonType = "button",
  formId,
  onClick,
  children,
}) {
  return (
    <div className="header-section">
      <p>{route}</p>

      <div className="header-actions">
        {children}

        {buttonText && (
          <button
            className="action-button"
            type={buttonType}
            form={formId}
            onClick={onClick}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;