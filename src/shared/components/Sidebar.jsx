import { Stack, NavLink } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import classes from "../../styles/Sidebar.module.css";
import companyLogoIcon from "../../assets/b_connect_egypt_logo-removebg-preview.png";




export default function Sidebar({ links }) {
  const { pathname } = useLocation();

  return (
    <Stack className={classes.sidebar} gap={2}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={companyLogoIcon}
          alt="B-Connect"
          style={{ width: 180, height: 180 }}
        />
      </div>

      {links.map((item) => {
        if (!item.children) {
          return (
            <NavLink
              key={item.label}
              className={classes.link}
              classNames={{ label: classes.linkLabel }}
              component={Link}
              leftSection={
                <img src={item.icon} alt={item.label} width={26} height={26} />
              }
              to={item.to}
              label={item.label}
              active={pathname === item.to}
            />
          );
        }

        return (
          <NavLink
            key={item.label}
            className={classes.link}
            classNames={{ label: classes.linkLabel }}
            label={item.label}
            defaultOpened={item.children.some((c) => pathname.startsWith(c.to))}
          >
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                className={classes.link}
                classNames={{ label: classes.linkLabel }}
                component={Link}
                to={child.to}
                leftSection={
                  <img
                    src={item.icon}
                    alt={item.label}
                    width={18}
                    height={18}
                  />
                }
                label={child.label}
                active={pathname === child.to}
                onClick={()=>{console.log("Clicked")}}
              />
            ))}
          </NavLink>
        );
      })}
    </Stack>
  );
}
