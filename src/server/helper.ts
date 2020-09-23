import { Response, Request } from "restify";
import { promises as fs } from "fs";

const DB_NAME: string = "fullstack-react-db-agnostic-typescript-starter-example-db";
const COLLECTION_NAME: string = "entry";

// mock a MongoDB client
// tslint:disable:no-any
const mockDatabase: { [tableName: string]: any } = {
  [COLLECTION_NAME]: {
    "0": { id: 0, name: "mock entry #1" },
    "1": { id: 1, name: "mock entry #2" }
  }
};
const dbClient = {
    getTable: (tableName: string) => {
      const table: object = mockDatabase[tableName];
      return {
        find: () => {
          return {
            toArray: () => Object.values(table) || []
          };
        },
        insertOne: (obj: any) => {
          const id: number = obj.id || Object.keys(table).length;
          mockDatabase[tableName][id] = { ...obj, id };
          return { insertedId: id, result: { ok: true } };
        }
      };
    }
};
// tslint:enable

export { dbClient };

export async function outputView(req: Request, res: Response, templatePath: string): Promise<void> {
    try {
        const layout = await fs.readFile("./view-templates/index.html");
        res.sendRaw(200, layout.toString("utf-8"), {
            "Content-Type": "text/html",
            "Content-Length": String(layout.byteLength)
        });
    } catch (e) {
        res.send(500, e.message);
    }
}

export async function submitEntry(req: Request, res: Response): Promise<void> {

    const { firstName, lastName, email, eventDate } = req.body;

    // server-side validation for fields retrieved from request body
    const errors: string[] = [];
    if (firstName == null || firstName === "") errors.push("invalid `firstName`");
    if (lastName == null || lastName === "") errors.push("invalid `lastName`");
    if (!isValidEmail(email)) errors.push("invalid `email`");
    // if (isNaN(eventDate)) errors.push("invalid `eventDate`");
    if (errors.length) {
        return res.send(403, { message: `Invalid entry submitted`, details: { errors } });
    }

    const col = await getDbCollection(COLLECTION_NAME);
    const opRes = await col.insertOne({ firstName, lastName, email, eventDate });
    const { insertedId } = opRes;

    if (opRes.result.ok) {
        return res.send(200, { message: `Entry submitted`, details: { insertedId } });
    } else {
        return res.send(500, { message: `Failed to submit entry`, details: opRes.result });
    }

}

export async function getEntries(req: Request, res: Response): Promise<void> {

    const col = await getDbCollection(COLLECTION_NAME);
    try {
        const allEntries = await col.find().toArray();
        return res.send({ message: `Listing all entries`, details: allEntries });
    } catch (e) {
        return res.send(500, { message: `Failed parsing result from database: ${e.message}` });
    }

}

function getDbCollection(collectionName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {

        try {

            const col = dbClient.getTable(collectionName);
            resolve(col);

        } catch (e) {
            return reject(new Error(`Apologies, we could not connect to the database`));
        }

    });
}

// @TODO share this logic between client & server codebases
const EMAIL_REGEXP = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
function isValidEmail(input: string): boolean {
    return EMAIL_REGEXP.test(input);
}
