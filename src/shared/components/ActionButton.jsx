import { Menu } from "@mantine/core";
import MenuIcon from "../../assets/menu.png";
import { useTranslation } from "react-i18next";

export default function ActionButton({isRowSelected,onClick}) {
  const {t} = useTranslation();
  if (!isRowSelected) return null;

  return (
    <Menu shadow="md" width={180}>
      <Menu.Target>
        <button
          className="action-button"
          style={{ backgroundColor: "#000000" }}
        >
          <p>{t("ACTIONS")}</p>
        </button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item style={{fontFamily:"Cairo"}} >{t("EDIT")}</Menu.Item>

      <Menu.Item style={{fontFamily:"Cairo"}} >{t("ENABLE")}</Menu.Item>

       <Menu.Item style={{fontFamily:"Cairo"}} >{t("DISABLE")}</Menu.Item>

       
          <Menu.Item style={{fontFamily:"Cairo",color:"red"}} onClick={onClick} >
            {t("DELETE")}
          </Menu.Item>
       
      </Menu.Dropdown>
    </Menu>
  );
}