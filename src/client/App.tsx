import * as React from "react";
import { useState } from "react";
import { Classes, Dialog, InputGroup, Button, Intent, H5, Callout } from "@blueprintjs/core";
import { isValidEmail } from "./helper";
import { submitEntry } from "./services";
import { IRespPayload } from "./services";

const App: React.FunctionComponent = () => {

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    // const [eventDate, setEventDate] = useState<Date>(new Date());
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>("");

    function validateAllFields(): true | string[] {
        const validationIssues: string[] = [];
        if (firstName === "") validationIssues.push("missing first name");
        if (lastName === "") validationIssues.push("missing last name");
        if (!isValidEmail(email)) validationIssues.push("invalid email address");
        // if (eventDate == null) validationIssues.push("missing event date");
        return validationIssues.length ? validationIssues : true;
    }

    async function attemptSubmit(): Promise<void> {

        if (isSubmitting) return;

        // clear error and feedback views before making a new submission
        setErrors([]);
        setFeedback("");

        const validationResult: true | string[] = validateAllFields();
        if (validationResult === true) {

            setIsSubmitting(true);
            try {

                // send all fields to backend
                const resp: IRespPayload = await submitEntry({ firstName, lastName, email });
                setFeedback(resp.message);
                
            } catch (e) {
                // display API call error
                setErrors([`An error occurred: ${e.message}`]);
            }
            setIsSubmitting(false);

        } else {
            // display validation error(s)
            setErrors(validationResult);
        }

    }

    return <div>
        <Dialog
          isOpen={true}
          title={"A db-agnostic, React-based web application starter boilerplate"}
          isCloseButtonShown={false}
          style={{ minWidth: 600 }}
        >
            <div className={Classes.DIALOG_BODY}>
                <H5>Demo simple web app <small>(all fields are required)</small></H5>
                <form action="#">
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ flexGrow: 1 }}>
                        <InputGroup
                            name="firstName"
                            type="text"
                            inputMode="text"
                            fill
                            placeholder={"first name"}
                            value={firstName}
                            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setFirstName(evt.target.value)}
                        />
                    </div>
                    <div style={{ minWidth: 10, flexGrow: 0 }} />
                    <div style={{ flexGrow: 1 }}>
                        <InputGroup
                            name="lastName"
                            type="text"
                            inputMode="text"
                            fill
                            placeholder={"last name"}
                            value={lastName}
                            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setLastName(evt.target.value)}
                        />
                    </div>
                </div>
                <InputGroup
                    style={{ marginTop: 10, marginBottom: 10 }}
                    name="email"
                    type="email"
                    inputMode="email"
                    placeholder={"email"}
                    value={email}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setEmail(evt.target.value)}
                />
                </form>
                {feedback !== "" && <Callout style={{ marginTop: 10 }} className="co-feedback">
                    <span>{feedback}</span>
                    {" "}
                    (<a href="/entries" target="_blank" style={{ textDecoration: "underline", color: "inherit" }}>
                        view all entries as JSON
                    </a>)
                </Callout>}
                {errors.length > 0 && <Callout intent={Intent.DANGER} icon={null} style={{ marginTop: 10 }} className="co-errors">
                    <ul style={{ padding: "0 0 0 20px", margin: 0 }}>
                        {errors.map((error, i) => <li key={i}>{error}</li>)}
                    </ul>
                </Callout>}
            </div>
            <div className={Classes.DIALOG_FOOTER} style={{ textAlign: "right" }}>
                <Button type="submit" text={"Submit"} intent={Intent.PRIMARY} onClick={attemptSubmit} autoFocus />
            </div>
        </Dialog>
    </div>;

}

export default App;
