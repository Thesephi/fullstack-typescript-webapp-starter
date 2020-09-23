interface IEntry {
    firstName: string;
    lastName: string;
    email: string;
    // eventDate: Date;
}

export interface IRespPayload {
    message: string;
    details?: unknown;
}

export function submitEntry(entry: IEntry): Promise<IRespPayload> {
    return new Promise((resolve, reject) => {

        window.fetch("/entry", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName: entry.firstName.trim(),
                lastName: entry.lastName.trim(),
                email: entry.email.trim(),
                // eventDate: entry.eventDate.getTime()
            })
        })
        .then(resp => resolve(resp.json()))
        .catch(reject);

    });
}
