import { PageRequest, Page } from "./page";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { USERS } from "./mock-users";

export interface UserQuery {
  search: string;
  registrationDate: Date | undefined;
}

export interface User {
  id: number;
  username: string;
  email: string;
  registrationDate: Date;
}

export function getUsersPage(
  request: PageRequest<User>,
  query: UserQuery
): Observable<Page<User>> {
  /* MOCKED PAGINATION: do your server request here instead */
  let filteredUsers = USERS.map(({ registrationDate, ...rest }) => ({
    ...rest,
    registrationDate: new Date(registrationDate),
  }));
  const { search, registrationDate } = query;
  if (search) {
    const lowered = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      ({ username, email }) =>
        username.toLowerCase().includes(lowered) ||
        email.toLowerCase().includes(lowered)
    );
  }
  if (registrationDate) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.registrationDate.getFullYear() ===
          registrationDate.getFullYear() &&
        user.registrationDate.getMonth() === registrationDate.getMonth() &&
        user.registrationDate.getDate() === registrationDate.getDate()
    );
  }
  if (request.sort) {
    const { property, order } = request.sort;
    filteredUsers = [...filteredUsers].sort((a, b) => {
      const propA = a[property];
      const propB = b[property];
      let result;
      if (typeof propA === "string") {
        result = propA
          .toLowerCase()
          .localeCompare(propB.toString().toLowerCase());
      } else {
        result = (propA as any) - (propB as any);
      }
      const factor = order === "asc" ? 1 : -1;
      return result * factor;
    });
  }
  const start = request.page * request.size;
  const end = start + request.size;
  const pageUsers = filteredUsers.slice(start, end);
  const page = {
    content: pageUsers,
    number: request.page,
    size: request.size,
    totalElements: filteredUsers.length,
  };
  return of(page).pipe(delay(500));
}
