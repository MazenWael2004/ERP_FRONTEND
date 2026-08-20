import React from 'react'
import usersIcon from "../../../assets/users.png";
import LauncherAppItem from './LauncherAppItem';
import employeesIcon from '../../../assets/images/logos/employees.png';
import CRMIcon from '../../../assets/images/logos/CRM.png';
import administrationIcon from '../../../assets/images/logos/administrator.png'
import salesIcon from '../../../assets/images/logos/sales.png';
import ticketIcon from '../../../assets/images/logos/ticket.png';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';


function LauncherContent() {
  const {t} = useTranslation();
  const nav =useNavigate();
  return (
    <div className="launcher-content-outer-container">
        <div className="launcher-content-inner-container">
            <LauncherAppItem name={t("ADMINISTRATION")} icon={administrationIcon} iconClass='icon1' onClick={() => nav("/employees")}  />
            <LauncherAppItem name={t("CRM")} icon={CRMIcon} iconClass='icon3' onClick={() => nav("/jobs")} />
            <LauncherAppItem name='Sales' icon={salesIcon} iconClass='icon4' />
            {/* <LauncherAppItem name='Ticketing System' icon={ticketIcon} iconClass='icon5' /> */}
        </div>
    </div>
  )
}

export default LauncherContent