export interface MenuItem {
  id: number;
  label: string;
  description?: string;
  icon?: string;
  route?: string;
  routerLink?: string;
  menuOrder?: number;
  visible: boolean;
  active: boolean;
  children?: MenuItem[];
}

export interface UserMenuResponseDto {
  userId: number;
  username: string;
  userRole: string;
  menus: MenuItem[];
}
