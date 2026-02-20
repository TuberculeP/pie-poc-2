import { Resend } from "resend";

const { RESEND_API_KEY } = process.env;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export default resend;
