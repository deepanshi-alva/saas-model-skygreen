import {sendEmail} from "../../lib/utils";
import toast from "react-hot-toast";

export default function WelcomeEmail() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const to = e.target.email.value;
    const subject = e.target.subject.value;
    const text = e.target.message.value;

    try {
      const result = await sendEmail({ to, subject, text });
      if(result) toast.success('Email sent successfully!');
      console.log("res", result);
    } catch (error) {
      console.error(error);
      alert('Failed to send email');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Receiver email" required />
      <input type="text" name="subject" placeholder="Subject" required />
      <textarea name="message" placeholder="Message" required />
      <button type="submit">Send Email</button>
    </form>
  );
}
