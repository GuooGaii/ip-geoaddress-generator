"use client";

import { DataList } from "@radix-ui/themes";
import { User } from "../types";
import { InfoItem } from "./InfoItem";
import { Signal } from "@preact/signals-react";

interface UserInfoProps {
  userSignal: Signal<User | null>;
  loading: boolean;
  email: string;
}

interface UserField {
  id: string;
  label: string;
  getValue: (user: User, email: string) => string;
}

export function UserInfo({
  userSignal,
  loading,
  email,
}: Readonly<UserInfoProps>) {
  const userFields: UserField[] = [
    {
      id: "last",
      label: "姓",
      getValue: (user) => user.name.last,
    },
    {
      id: "first",
      label: "名",
      getValue: (user) => user.name.first,
    },
    {
      id: "phone",
      label: "电话",
      getValue: (user) => user.phone,
    },
    {
      id: "ssn",
      label: "SSN",
      getValue: (user) => user.id.value || "暂无",
    },
    {
      id: "email",
      label: "邮箱",
      getValue: (_, email) => email,
    },
  ];

  return (
    <DataList.Root>
      {userFields.map((field) => (
        <InfoItem
          key={field.id}
          label={field.label}
          value={
            userSignal.value
              ? field.getValue(userSignal.value, email)
              : undefined
          }
          loading={loading}
        />
      ))}
    </DataList.Root>
  );
}
