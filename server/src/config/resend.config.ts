import { Resend } from "resend";

const { RESEND_APY_KEY } = process.env;

const resend = new Resend(RESEND_APY_KEY);

export default resend;
