
import Header from "../components/Header";
import ErrorPageIcon from "../../assets/404 Error-rafiki.png";
import { replace, useNavigate } from "react-router-dom";

function NotFoundPage() {
  const nav = useNavigate();
  return (
    <MainLayout>
      <div className="error-page">
        <img
          src={ErrorPageIcon}
          alt="Error Page Not Found"
          style={{ width: 500, height: 500 }}
        />
        <h1>404</h1>
        <h2>Not Found</h2>
        <div
          className="home-button"
          onClick={() => nav("/desk", { replace: true })}
        >
          Back to Home
        </div>
      </div>
    </MainLayout>
  );
}

export default NotFoundPage;
