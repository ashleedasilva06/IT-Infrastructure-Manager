"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Badge, Btn, PageHeader, Table, Td, Tr } from "@/components/ui";

export default function UsersPage() {
  const { token, user } = useAuth();
  const api = createApi(token);
  const [users, setUsers] = useState([]);

  const load = () => api.get("/auth/users").then(setUsers);
  useEffect(() => { if (token) load(); }, [token]);

  const changeRole = async (id, role) => {
    await api.patch(`/auth/users/${id}/role?role=${role}`, {});
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    await api.del(`/auth/users/${id}`);
    load();
  };

  return (
    <AppLayout>
      <PageHeader title="Users" />

      <Table
        headers={["#", "Name", "Email", "Username", "Role", "Actions"]}
        empty={users.length === 0 ? "No users found." : null}
      >
        {users.map((u) => (
          <Tr key={u.id}>
            <Td mono>{u.id}</Td>
            <Td><span className="font-semibold text-slate-100">{u.name}</span></Td>
            <Td mono>{u.email}</Td>
            <Td mono>{u.username}</Td>
            <Td><Badge value={u.role} /></Td>
            <Td>
              {user?.id !== u.id && (
                <div className="flex gap-2">
                  {u.role === "user" ? (
                    <Btn
                      variant="outline"
                      className="px-2 py-1 text-xs"
                      onClick={() => changeRole(u.id, "admin")}
                    >
                      Make Admin
                    </Btn>
                  ) : (
                    <Btn
                      variant="outline"
                      className="px-2 py-1 text-xs"
                      onClick={() => changeRole(u.id, "user")}
                    >
                      Make User
                    </Btn>
                  )}
                  <Btn
                    variant="danger"
                    className="px-2 py-1 text-xs"
                    onClick={() => remove(u.id)}
                  >
                    Delete
                  </Btn>
                </div>
              )}
            </Td>
          </Tr>
        ))}
      </Table>
    </AppLayout>
  );
}