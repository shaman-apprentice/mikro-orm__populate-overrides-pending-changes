import type { Rel } from "@mikro-orm/core";
import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Car } from "./car";
import { DoorHandle } from "./door-handle";
import { Window } from "./window";

@Entity()
export class Door {
  @PrimaryKey()
  id!: number;

  @Property()
  position!: string;

  @ManyToOne(() => Car)
  car!: Rel<Car>;

  @OneToOne(() => DoorHandle, { mappedBy: "door" })
  handle?: Rel<DoorHandle> | null;

  @OneToOne(() => Window, { mappedBy: "door", nullable: true })
  window!: Rel<Window> | null;
}
