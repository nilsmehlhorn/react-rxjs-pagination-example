import React, { useRef } from "react";
import { useObservable } from "react-use";
import { Sort, SortOrder } from "../lib/page";
import { Pagination } from "../lib/pagination";
import { getUsersPage, User, UserQuery } from "../lib/users";

import styles from "./Table.module.css";

const initialSort: Sort<User> = { property: "id", order: "asc" };
const initialQuery: UserQuery = { search: "", registrationDate: undefined };
const pageSize = 5;

export const Table: React.FC = () => {
  const { current: pagination } = useRef(
    new Pagination<User, UserQuery>(
      getUsersPage,
      initialSort,
      initialQuery,
      pageSize
    )
  );
  const page = useObservable(pagination.page$);
  const loading = useObservable(pagination.loading$);
  if (!page) {
    return <p>Loading ...</p>;
  }

  const totalPages = Math.ceil(page.totalElements / pageSize);

  const onSortPropertyChange = ({
    target,
  }: React.ChangeEvent<HTMLSelectElement>) => {
    pagination.sortBy({ property: target.value as keyof User });
  };
  const onSortOrderChange = ({
    target,
  }: React.ChangeEvent<HTMLSelectElement>) => {
    pagination.sortBy({ order: target.value as SortOrder });
  };

  const onQuerySearchChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    pagination.queryBy({ search: target.value });
  };

  const onQueryRegistrationDateChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const registrationDate = target.value ? new Date(target.value) : undefined;
    pagination.queryBy({ registrationDate });
  };

  return (
    <>
      <div className={styles.toolbar}>
        <fieldset>
          <label htmlFor="sortProperty">Sort by</label>
          <select
            name="sortProperty"
            id="sortProperty"
            onChange={onSortPropertyChange}
            defaultValue={initialSort.property}
          >
            <option value="id">ID</option>
            <option value="username">Username</option>
          </select>
        </fieldset>
        <fieldset>
          <label htmlFor="sortDirection">Sort Direction</label>
          <select
            name="sortDirection"
            id="sortDirection"
            onChange={onSortOrderChange}
            defaultValue={initialSort.order}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </fieldset>
        <fieldset>
          <label htmlFor="searchInput">Search</label>
          <input
            id="searchInput"
            type="text"
            placeholder="Username, E-Mail ..."
            onInput={onQuerySearchChange}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="registrationDateInput">Registration Date</label>
          <input
            id="registrationDateInput"
            type="date"
            onChange={onQueryRegistrationDateChange}
          />
        </fieldset>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>E-Mail</th>
            <th>Registration</th>
          </tr>
        </thead>
        <tbody>
          {page.content.map((user) => {
            return (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.registrationDate.toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.paginator}>
        <button
          disabled={page.number === 0}
          onClick={() => pagination.fetch(page.number - 1)}
        >
          Previous
        </button>
        <button
          disabled={totalPages === page.number + 1}
          onClick={() => pagination.fetch(page.number + 1)}
        >
          Next
        </button>
        <span>
          {page.number + 1} / {totalPages}
        </span>
        {loading && <span>Loading ...</span>}
      </div>
    </>
  );
};
