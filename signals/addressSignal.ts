import type { Address, Coordinates } from "@/app/types";
import { signal } from "@preact/signals-react";

export const addressSignal = signal<Address | null>(null);

export const coordinatesSignal = signal<Coordinates | null>(null);
