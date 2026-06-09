import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-copy">
        <p className="eyebrow">Async video pipeline</p>
        <h2>Upload now. Process in the background.</h2>
        <p>
          React handles the experience. BullMQ handles the queue. FFmpeg does
          the heavy lifting.
        </p>
      </section>
      <LoginForm />
    </main>
  );
}
