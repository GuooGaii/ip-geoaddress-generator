import { signal } from "@preact/signals-react";
import type { User } from "@/app/types";

export const userSignal = signal<User | null>(null);
