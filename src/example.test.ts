import "reflect-metadata";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { MikroORM } from "@mikro-orm/sqlite";
import { Car } from "./entities/car";
import { Door } from "./entities/door";
import { Window } from "./entities/window";
import { DoorHandle } from "./entities/door-handle";

let orm: MikroORM;

beforeEach(async () => {
  orm = await MikroORM.init({
    dbName: ":memory:",
    entities: [Car, Door, DoorHandle, Window],
    metadataProvider: ReflectMetadataProvider,
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refresh();

  const car = orm.em.create(Car, { model: "Example car", id: 1 });
  const door = orm.em.create(Door, { position: "front left", car, window: null, id: 1 });
  orm.em.create(Window, { tint: "darkened", door, id: 1, });

  await orm.em.flush();
  orm.em.clear();
});

afterEach(async () => {
  await orm.close(true);
});

test("flush of pending changes before populate works", async () => {
  const myDoor = await orm.em.findOneOrFail(
    Door,
    1,
    { populate: ["handle"] }
  );
  const handle = orm.em.create(DoorHandle, { shape: "A", door: myDoor });
  myDoor.handle = handle;

  await orm.em.flush(); // note this "early" flush of pending changes

  const myCar = await orm.em.findOneOrFail(
    Car,
    1,
    { populate: ["doors.window", "doors.handle"] },
  );
  myCar.doors.getItems()[0].window!.tint = "clear";

  await orm.em.flush();

  // Expect
  const updatedDoor = await orm.em.findOneOrFail(
    Door,
    1,
    { populate: ["window", "handle"] },
  );
  expect(updatedDoor.handle?.shape).toBe("A");
  expect(updatedDoor.window?.tint).toBe("clear");
});

test("populating and then updating works", async () => {
  const myCar = await orm.em.findOneOrFail(
    Car,
    1,
    { populate: ["doors.window", "doors.handle"] },
  );
  myCar.doors.getItems()[0].window!.tint = "clear";

  const myDoor = await orm.em.findOneOrFail(
    Door,
    1,
    { populate: ["handle"] }
  );
  const handle = orm.em.create(DoorHandle, { shape: "A", door: myDoor });
  myDoor.handle = handle;

  await orm.em.flush();

  // Expect
  const updatedDoor = await orm.em.findOneOrFail(
    Door,
    1,
    { populate: ["window", "handle"] },
  );
  expect(updatedDoor.handle?.shape).toBe("A");
  expect(updatedDoor.window?.tint).toBe("clear");
});

// this looses track of pending work / newly created door handle and FAILS
test("updating and populating works", async () => {
  const myDoor = await orm.em.findOneOrFail(
    Door,
    1,
    { populate: ["handle"] }
  );
  const handle = orm.em.create(DoorHandle, { shape: "A", door: myDoor });
  myDoor.handle = handle;

  // no early flush of pending changes - setting global flushMode to `FlushMode.ALWAYS` would make this test pass.

  const myCar = await orm.em.findOneOrFail(
    Car,
    1,
    { populate: ["doors.window", "doors.handle"] },
  );
  myCar.doors.getItems()[0].window!.tint = "clear";

  await orm.em.flush();

  // Expect
  const updatedDoor = await orm.em.findOneOrFail(
    Door,
    1,
    { populate: ["window", "handle"] },
  );
  expect(updatedDoor.handle?.shape).toBe("A");
  expect(updatedDoor.window?.tint).toBe("clear");
});