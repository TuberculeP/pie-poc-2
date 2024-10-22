import { getAllFooBarsQuery } from "./fooBar.query";
import { pg } from "../../config/db.config";
import type { Foo } from "../../../../types/fooBar";

const getAllFooBars = async () => {
  const query = getAllFooBarsQuery;
  const { rows } = await pg.query<Foo>(query);
  return rows;
};

export { getAllFooBars };
