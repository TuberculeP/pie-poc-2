import { Resend } from "resend";

const { RESEND_API_KEY } = process.env;

const resend = new Resend(RESEND_API_KEY);

export default resend;
