export interface LoginFormRequest { // to define the shape of  loginData sent by user.....
  userName: string;
  password: string;
}

export interface LoginFormResponse {
  message: string;
  token: string;
  data: {
    id: number;
    username: string;
    is_enabled:boolean;
    employee_id:number;
    email: string;
    name_ar:string;
    name_en:string;
  };
}


export interface loggedUser {
  id: number;
  username: string;
  name_ar:string;
  name_en:string;
  employee_id:number;
}
