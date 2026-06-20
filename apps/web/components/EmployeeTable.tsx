import type { Employee } from "@prisma/client";
import { dateInputValue } from "@/lib/validators";
import Link from "next/link";

export default function EmployeeTable({ employees }: { employees: Employee[] }) {
  if (employees.length === 0) {
    return <div className="empty">No employees yet.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Employment Type</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.employeeId}</td>
              <td>{employee.firstName}</td>
              <td>{employee.lastName}</td>
              <td>
                <div>{employee.email}</div>
                <div className="muted">{employee.phoneNumber ?? ""}</div>
              </td>
              <td>{employee.username}</td>
              <td>
                <div>{employee.jobTitle}</div>
                <div className="muted">{employee.department}</div>
              </td>
              <td>
                <div>{employee.phoneNumber ?? ""}</div>
                <div className="muted">{employee.managerEmail ?? ""}</div>
              </td>
              <td>{employee.employmentType}</td>
              <td>
                <span className={`status-pill ${employee.status.toLowerCase()}`}>{employee.status}</span>
              </td>
              <td>{dateInputValue(employee.startDate)}</td>
              <td>
                <div>{employee.location ?? ""}</div>
                <div className="muted">{[employee.country, employee.state].filter(Boolean).join(", ")}</div>
              </td>
              <td>
                <Link className="button secondary" href={`/employees/${employee.id}/edit`}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
